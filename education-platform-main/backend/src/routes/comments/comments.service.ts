import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { CreateCommentDto, UpdateCommentDto, QueryCommentsDto } from './dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async createComment(createCommentDto: CreateCommentDto, authorId: string) {
    const { postId, parentId, content } = createCommentDto;

    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, status: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.status !== 'published') {
      throw new BadRequestException('Cannot comment on unpublished posts');
    }

    // If parentId provided, verify parent comment exists and belongs to same post
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
        select: { postId: true },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.postId !== postId) {
        throw new BadRequestException(
          'Parent comment must belong to the same post',
        );
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content,
        postId,
        parentId,
        authorId,
      },
      include: {
        author: {
          include: { profile: true },
        },
        _count: {
          select: { replies: true },
        },
      },
    });

    return comment;
  }

  async findAll(queryDto: QueryCommentsDto) {
    const page = parseInt(queryDto.page || '1');
    const limit = parseInt(queryDto.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (queryDto.postId) {
      where.postId = queryDto.postId;
      where.parentId = null; // Only top-level comments for post listing
    }

    let orderBy: any = { createdAt: 'desc' };
    if (queryDto.sort === 'old') {
      orderBy = { createdAt: 'asc' };
    } else if (queryDto.sort === 'top') {
      orderBy = { upvotes: 'desc' };
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: {
          author: {
            include: { profile: true },
          },
          replies: {
            include: {
              author: {
                include: { profile: true },
              },
            },
            orderBy: { createdAt: 'asc' },
            take: 3, // Show first 3 replies
          },
          _count: {
            select: { replies: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          include: { profile: true },
        },
        replies: {
          include: {
            author: {
              include: { profile: true },
            },
            replies: {
              include: {
                author: {
                  include: { profile: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: { replies: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async updateComment(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { roleId: true },
      });

      if (user?.roleId !== 'admin' && user?.roleId !== 'moderator') {
        throw new ForbiddenException('You can only edit your own comments');
      }
    }

    return this.prisma.comment.update({
      where: { id },
      data: updateCommentDto,
      include: {
        author: {
          include: { profile: true },
        },
      },
    });
  }

  async deleteComment(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { roleId: true },
      });

      if (user?.roleId !== 'admin' && user?.roleId !== 'moderator') {
        throw new ForbiddenException('You can only delete your own comments');
      }
    }

    // Delete comment and all its replies
    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Comment deleted successfully' };
  }

  async getReplies(commentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [replies, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { parentId: commentId },
        include: {
          author: {
            include: { profile: true },
          },
          _count: {
            select: { replies: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { parentId: commentId } }),
    ]);

    return {
      replies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
