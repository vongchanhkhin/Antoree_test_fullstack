import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { UpdateProfileDto } from './dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async getProfile(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            roleId: true,
            isActive: true,
            createdAt: true,
            role: true,
          },
        },
        level: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(
    id: string,
    updateProfileDto: UpdateProfileDto,
    currentUserId: string,
  ) {
    // Check if user can edit this profile
    if (id !== currentUserId) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: { roleId: true },
      });

      if (
        currentUser?.roleId !== 'admin' &&
        currentUser?.roleId !== 'moderator'
      ) {
        throw new ForbiddenException('You can only edit your own profile');
      }
    }

    const profile = await this.prisma.profile.update({
      where: { userId: id },
      data: updateProfileDto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            roleId: true,
            role: true,
          },
        },
        level: true,
      },
    });

    return profile;
  }

  async getProfileBadges(id: string) {
    const badges = await this.prisma.userBadge.findMany({
      where: { userId: id },
      include: {
        badge: true,
      },
      orderBy: { earnedAt: 'desc' },
    });

    return badges.map((userBadge) => ({
      ...userBadge.badge,
      earnedAt: userBadge.earnedAt,
    }));
  }

  async getProfileStats(id: string) {
    const [profile, postsCount, commentsCount, totalUpvotes, totalDownvotes] =
      await Promise.all([
        this.prisma.profile.findUnique({
          where: { userId: id },
          select: { points: true, reputation: true },
        }),
        this.prisma.post.count({
          where: { authorId: id, status: 'published' },
        }),
        this.prisma.comment.count({
          where: { authorId: id, status: 'visible' },
        }),
        this.prisma.post.aggregate({
          where: { authorId: id },
          _sum: { upvotes: true },
        }),
        this.prisma.post.aggregate({
          where: { authorId: id },
          _sum: { downvotes: true },
        }),
      ]);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return {
      points: profile.points,
      reputation: profile.reputation,
      posts: postsCount,
      comments: commentsCount,
      upvotes: totalUpvotes._sum.upvotes || 0,
      downvotes: totalDownvotes._sum.downvotes || 0,
    };
  }
}
