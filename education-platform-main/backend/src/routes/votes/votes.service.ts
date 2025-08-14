import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { CreateVoteDto, QueryVotesDto, TargetType } from './dto';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  async createVote(createVoteDto: CreateVoteDto, userId: string) {
    const { targetId, targetType, value } = createVoteDto;

    // Verify target exists
    if (targetType === TargetType.POST) {
      const post = await this.prisma.post.findUnique({
        where: { id: targetId },
        select: { id: true, authorId: true },
      });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      if (post.authorId === userId) {
        throw new BadRequestException('Cannot vote on your own post');
      }
    } else if (targetType === TargetType.COMMENT) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: targetId },
        select: { id: true, authorId: true },
      });
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }
      if (comment.authorId === userId) {
        throw new BadRequestException('Cannot vote on your own comment');
      }
    }

    // Check if user already voted on this target
    const existingVote = await this.prisma.vote.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetId,
          targetType,
        },
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote - remove the vote (toggle off)
        await this.prisma.$transaction(async (tx) => {
          await tx.vote.delete({
            where: {
              userId_targetType_targetId: {
                userId,
                targetId,
                targetType,
              },
            },
          });

          // Update counters
          await this.updateVoteCounters(tx, targetId, targetType, value, -1);
        });

        return { message: 'Vote removed' };
      } else {
        // Different vote - update the vote
        await this.prisma.$transaction(async (tx) => {
          await tx.vote.update({
            where: {
              userId_targetType_targetId: {
                userId,
                targetId,
                targetType,
              },
            },
            data: { value },
          });

          // Update counters (remove old vote, add new vote)
          const oldValue = existingVote.value;
          await this.updateVoteCounters(tx, targetId, targetType, oldValue, -1);
          await this.updateVoteCounters(tx, targetId, targetType, value, 1);
        });

        return { message: 'Vote updated' };
      }
    }

    // Create new vote
    const vote = await this.prisma.$transaction(async (tx) => {
      const newVote = await tx.vote.create({
        data: {
          userId,
          targetId,
          targetType,
          value,
        },
      });

      // Update counters
      await this.updateVoteCounters(tx, targetId, targetType, value, 1);

      return newVote;
    });

    return vote;
  }

  private async updateVoteCounters(
    tx: any,
    targetId: string,
    targetType: TargetType,
    voteValue: number,
    increment: number,
  ) {
    const updateData =
      voteValue === 1
        ? { upvotes: { increment } }
        : { downvotes: { increment } };

    if (targetType === TargetType.POST) {
      await tx.post.update({
        where: { id: targetId },
        data: updateData,
      });
    } else if (targetType === TargetType.COMMENT) {
      await tx.comment.update({
        where: { id: targetId },
        data: updateData,
      });
    }
  }

  async findAll(queryDto: QueryVotesDto) {
    const page = parseInt(queryDto.page || '1');
    const limit = parseInt(queryDto.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (queryDto.userId) {
      where.userId = queryDto.userId;
    }
    if (queryDto.targetType) {
      where.targetType = queryDto.targetType;
    }
    if (queryDto.value !== undefined) {
      where.value = queryDto.value;
    }

    const [votes, total] = await Promise.all([
      this.prisma.vote.findMany({
        where,
        include: {
          user: {
            include: { profile: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.vote.count({ where }),
    ]);

    return {
      votes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserVote(userId: string, targetId: string, targetType: TargetType) {
    return this.prisma.vote.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetId,
          targetType,
        },
      },
    });
  }

  async removeVote(userId: string, targetId: string, targetType: TargetType) {
    const vote = await this.prisma.vote.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetId,
          targetType,
        },
      },
    });

    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.vote.delete({
        where: {
          userId_targetType_targetId: {
            userId,
            targetId,
            targetType,
          },
        },
      });

      // Update counters
      await this.updateVoteCounters(tx, targetId, targetType, vote.value, -1);
    });

    return { message: 'Vote removed successfully' };
  }

  async getVoteStats(targetId: string, targetType: TargetType) {
    const stats = await this.prisma.vote.groupBy({
      by: ['value'],
      where: {
        targetId,
        targetType,
      },
      _count: {
        value: true,
      },
    });

    const result = {
      upvotes: 0,
      downvotes: 0,
      total: 0,
    };

    stats.forEach((stat) => {
      if (stat.value === 1) {
        result.upvotes = stat._count.value;
      } else if (stat.value === -1) {
        result.downvotes = stat._count.value;
      }
    });

    result.total = result.upvotes + result.downvotes;

    return result;
  }
}
