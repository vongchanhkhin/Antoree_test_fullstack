import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import {
  CreateReportDto,
  QueryReportsDto,
  QueryModerationDto,
  ModerationDecisionDto,
  ReportTarget,
  ModerationTarget,
  ModerationStatus,
} from './dto';

@Injectable()
export class ModerationService {
  constructor(private prisma: PrismaService) {}

  async createReport(dto: CreateReportDto, reporterId: string) {
    // Validate that the target exists
    await this.validateTarget(dto.targetType, dto.targetId);

    // Check if user already reported this target
    const existingReport = await this.prisma.report.findFirst({
      where: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
    });

    if (existingReport) {
      throw new BadRequestException('You have already reported this content');
    }

    // Create the report
    const report = await this.prisma.report.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        reason: dto.reason,
      },
      include: {
        reporter: {
          include: { profile: true },
        },
      },
    });

    // Add to moderation queue if not already there
    await this.addToModerationQueue(dto.targetType, dto.targetId, 'report', {
      reportId: report.id,
      reason: dto.reason,
    });

    return report;
  }

  async getReports(query: QueryReportsDto) {
    const {
      targetType,
      targetId,
      reporterId,
      search,
      page = '1',
      limit = '20',
    } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (targetType) {
      where.targetType = targetType;
    }
    if (targetId) {
      where.targetId = targetId;
    }
    if (reporterId) {
      where.reporterId = reporterId;
    }
    if (search) {
      where.reason = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            include: { profile: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data: reports,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getModerationQueue(query: QueryModerationDto) {
    const {
      targetType,
      source,
      status,
      reviewerId,
      page = '1',
      limit = '20',
    } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (targetType) {
      where.targetType = targetType;
    }
    if (source) {
      where.source = source;
    }
    if (status) {
      where.status = status;
    }
    if (reviewerId) {
      where.reviewerId = reviewerId;
    }

    const [queue, total] = await Promise.all([
      this.prisma.moderationQueue.findMany({
        where,
        include: {
          reviewer: {
            include: { profile: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.moderationQueue.count({ where }),
    ]);

    return {
      data: queue,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async moderateContent(
    queueId: string,
    decision: ModerationDecisionDto,
    reviewerId: string,
  ) {
    const queueItem = await this.prisma.moderationQueue.findUnique({
      where: { id: queueId },
    });

    if (!queueItem) {
      throw new NotFoundException('Moderation queue item not found');
    }

    if (queueItem.status !== 'pending') {
      throw new BadRequestException('This item has already been reviewed');
    }

    // Update moderation queue
    const updatedQueue = await this.prisma.moderationQueue.update({
      where: { id: queueId },
      data: {
        status: decision.status,
        reviewerId,
        decidedAt: new Date(),
        payload: {
          ...(queueItem.payload as object),
          reviewReason: decision.reason,
        },
      },
      include: {
        reviewer: {
          include: { profile: true },
        },
      },
    });

    // Take action based on decision
    if (decision.status === ModerationStatus.REJECTED) {
      await this.takeContentAction(
        queueItem.targetType as ModerationTarget,
        queueItem.targetId,
        'remove',
      );
    }

    return updatedQueue;
  }

  async getModerationStats() {
    const [pendingCount, totalReports, recentDecisions, reportsByType] =
      await Promise.all([
        this.prisma.moderationQueue.count({
          where: { status: 'pending' },
        }),
        this.prisma.report.count(),
        this.prisma.moderationQueue.count({
          where: {
            decidedAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            },
          },
        }),
        this.prisma.report.groupBy({
          by: ['targetType'],
          _count: { targetType: true },
        }),
      ]);

    const reportStats = reportsByType.reduce(
      (acc, item) => {
        acc[item.targetType] = item._count.targetType;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      pendingModerations: pendingCount,
      totalReports,
      recentDecisions,
      reportsByType: reportStats,
    };
  }

  private async validateTarget(targetType: ReportTarget, targetId: string) {
    let exists = false;

    switch (targetType) {
      case ReportTarget.POST: {
        const post = await this.prisma.post.findUnique({
          where: { id: targetId },
        });
        exists = !!post;
        break;
      }
      case ReportTarget.COMMENT: {
        const comment = await this.prisma.comment.findUnique({
          where: { id: targetId },
        });
        exists = !!comment;
        break;
      }
      case ReportTarget.USER: {
        const user = await this.prisma.user.findUnique({
          where: { id: targetId },
        });
        exists = !!user;
        break;
      }
    }

    if (!exists) {
      throw new NotFoundException(`${targetType} not found`);
    }
  }

  private async addToModerationQueue(
    targetType: ReportTarget,
    targetId: string,
    source: string,
    payload: any,
  ) {
    // Convert ReportTarget to ModerationTarget
    const moderationTargetMap = {
      [ReportTarget.POST]: ModerationTarget.POST,
      [ReportTarget.COMMENT]: ModerationTarget.COMMENT,
    };

    const moderationTarget = moderationTargetMap[targetType];
    if (!moderationTarget) {
      return; // Skip for user reports as they don't go to moderation queue
    }

    // Check if already in queue
    const existing = await this.prisma.moderationQueue.findFirst({
      where: {
        targetType: moderationTarget,
        targetId,
        status: 'pending',
      },
    });

    if (!existing) {
      await this.prisma.moderationQueue.create({
        data: {
          targetType: moderationTarget,
          targetId,
          source: source as any,
          payload,
        },
      });
    }
  }

  private async takeContentAction(
    targetType: ModerationTarget,
    targetId: string,
    action: 'remove' | 'hide',
  ) {
    if (action === 'remove') {
      switch (targetType) {
        case ModerationTarget.POST: {
          // Update post status or delete
          await this.prisma.post.update({
            where: { id: targetId },
            data: { status: 'draft' }, // Hide the post
          });
          break;
        }
        case ModerationTarget.COMMENT: {
          // Delete comment
          await this.prisma.comment.delete({
            where: { id: targetId },
          });
          break;
        }
      }
    }
  }
}
