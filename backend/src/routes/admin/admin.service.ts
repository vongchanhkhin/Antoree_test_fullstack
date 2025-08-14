import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getSystemStats() {
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalVotes,
      totalReports,
      totalArtifacts,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count(),
      this.prisma.comment.count(),
      this.prisma.vote.count(),
      this.prisma.report.count(),
      this.prisma.artifact.count(),
    ]);

    return {
      totalUsers,
      totalPosts,
      totalComments,
      totalVotes,
      totalReports,
      totalArtifacts,
    };
  }

  async getAllUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
        { profile: { username: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total };
  }

  async updateUserRole(userId: string, roleId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: { profile: true },
    });
  }

  async getModerationQueue() {
    return this.prisma.moderationQueue.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getRecentActivity() {
    const [recentPosts, recentComments, recentReports] = await Promise.all([
      this.prisma.post.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { include: { profile: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.comment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { include: { profile: true } },
          post: { select: { id: true, title: true } },
        },
      }),
      this.prisma.report.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { include: { profile: true } },
        },
      }),
    ]);

    return {
      recentPosts,
      recentComments,
      recentReports,
    };
  }
}
