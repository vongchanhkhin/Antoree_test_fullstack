import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import {
  CreateContributionDto,
  ApproveContributionDto,
  ContributionType,
  ContributionStatus,
} from './dto/contribution.dto';

@Injectable()
export class ContributionsService {
  constructor(private prisma: PrismaService) {}

  // Create a new contribution
  async createContribution(
    postId: string,
    contributorId: string,
    createContributionDto: CreateContributionDto,
  ) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, status: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== 'published') {
      throw new BadRequestException('Can only contribute to published posts');
    }

    // Contributors cannot contribute to their own posts
    if (post.authorId === contributorId) {
      throw new BadRequestException('Cannot contribute to your own post');
    }

    const contribution = await this.prisma.contribution.create({
      data: {
        postId,
        contributorId,
        type: createContributionDto.type,
        content: createContributionDto.content,
        description: createContributionDto.description,
      },
      include: {
        contributor: {
          include: { profile: true },
        },
        post: {
          select: { id: true, title: true, authorId: true },
        },
      },
    });

    return contribution;
  }

  // Get contributions for a specific post
  async getPostContributions(
    postId: string,
    status?: 'pending' | 'approved' | 'rejected',
  ) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const where: any = { postId };
    if (status) {
      where.status = status;
    }

    const contributions = await this.prisma.contribution.findMany({
      where,
      include: {
        contributor: {
          include: { profile: true },
        },
        moderator: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contributions;
  }

  // Approve or reject a contribution (moderator only)
  async moderateContribution(
    contributionId: string,
    moderatorId: string,
    approveDto: ApproveContributionDto,
  ) {
    // Check if moderator has permission
    const moderator = await this.prisma.user.findUnique({
      where: { id: moderatorId },
      select: { roleId: true },
    });

    if (!moderator || !['admin', 'moderator'].includes(moderator.roleId)) {
      throw new ForbiddenException('Only moderators can approve contributions');
    }

    const contribution = await this.prisma.contribution.findUnique({
      where: { id: contributionId },
      include: {
        contributor: { include: { profile: true } },
        post: { select: { id: true, title: true, authorId: true } },
      },
    });

    if (!contribution) {
      throw new NotFoundException('Contribution not found');
    }

    if (contribution.status !== 'pending') {
      throw new BadRequestException('Contribution has already been moderated');
    }

    const pointsToAward = this.calculatePoints(
      contribution.type,
      approveDto.status,
    );

    const updatedContribution = await this.prisma.$transaction(async (tx) => {
      // Update contribution
      const updated = await tx.contribution.update({
        where: { id: contributionId },
        data: {
          status: approveDto.status,
          moderatorId,
          moderatorNote: approveDto.moderatorNote,
          pointsAwarded: pointsToAward,
          approvedAt: approveDto.status === 'approved' ? new Date() : null,
        },
        include: {
          contributor: { include: { profile: true } },
          moderator: { include: { profile: true } },
          post: { select: { id: true, title: true, authorId: true } },
        },
      });

      // Award points to contributor if approved
      if (approveDto.status === 'approved' && pointsToAward > 0) {
        await tx.profile.update({
          where: { userId: contribution.contributorId },
          data: {
            points: { increment: pointsToAward },
            reputation: { increment: Math.floor(pointsToAward / 2) },
          },
        });
      }

      return updated;
    });

    return updatedContribution;
  }

  // Calculate points based on contribution type and approval status
  private calculatePoints(type: string, status: string): number {
    if (status !== 'approved') return 0;

    const pointsMap = {
      edit: 5,
      add_example: 10,
      add_question: 15,
    };

    return pointsMap[type] || 0;
  }

  // Get recent contributions with stats
  async getContributionStats(period: 'week' | 'month' = 'week') {
    const now = new Date();
    const startDate = new Date();

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate.setMonth(now.getMonth() - 1);
    }

    const contributions = await this.prisma.contribution.findMany({
      where: {
        status: 'approved',
        approvedAt: {
          gte: startDate,
        },
      },
      include: {
        contributor: {
          include: { profile: true },
        },
      },
    });

    // Group by contributor and calculate totals
    const contributorStats = contributions.reduce((acc, contribution) => {
      const userId = contribution.contributorId;
      if (!acc[userId]) {
        acc[userId] = {
          contributor: contribution.contributor,
          totalContributions: 0,
          totalPoints: 0,
          contributions: [],
        };
      }
      acc[userId].totalContributions++;
      acc[userId].totalPoints += contribution.pointsAwarded;
      acc[userId].contributions.push(contribution);
      return acc;
    }, {});

    // Sort by total points descending
    const topContributors = Object.values(contributorStats)
      .sort((a: any, b: any) => b.totalPoints - a.totalPoints)
      .slice(0, 10);

    return {
      period,
      totalContributions: contributions.length,
      topContributors,
    };
  }
}
