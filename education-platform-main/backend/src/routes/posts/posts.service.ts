import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { CreatePostDto, UpdatePostDto, QueryPostsDto } from './dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async createPost(createPostDto: CreatePostDto, authorId: string) {
    const {
      tags,
      status,
      media,
      categoryId: _categoryId,
      difficulty: _difficulty,
      ...postData
    } = createPostDto;
    // categoryId and difficulty are ignored as they don't exist in the DB schema
    void _categoryId;
    void _difficulty;
    const postStatus = status === 'published' ? 'published' : 'published';

    const post = await this.prisma.$transaction(async (tx) => {
      // Create post
      const newPost = await tx.post.create({
        data: {
          ...postData,
          authorId,
          skills: createPostDto.skills,
          status: postStatus,
          publishedAt: new Date(),
        },
        include: {
          author: {
            include: { profile: true },
          },
          level: true,
        },
      });

      // Handle media if provided
      if (media && media.length > 0) {
        const mediaPromises = media.map((mediaItem, index) => {
          let mediaType: 'image' | 'audio' | 'video';
          let mediaUrl: string;

          if (typeof mediaItem === 'string') {
            // Auto-detect type from URL
            mediaUrl = mediaItem;
            if (
              mediaUrl.includes('/video/') ||
              mediaUrl.includes('.mp3') ||
              mediaUrl.includes('.wav') ||
              mediaUrl.includes('.ogg')
            ) {
              mediaType = 'audio';
            } else {
              mediaType = 'image';
            }
          } else {
            mediaType = mediaItem.type === 'audio' ? 'audio' : 'image';
            mediaUrl = mediaItem.url;
          }

          return tx.postMedia.create({
            data: {
              postId: newPost.id,
              kind: mediaType,
              url: mediaUrl,
              meta: { order: index },
            },
          });
        });

        await Promise.all(mediaPromises);
      }

      // Handle tags if provided
      if (tags && tags.length > 0) {
        const tagPromises = tags.map(async (tagName) => {
          // Find or create tag
          const tag = await tx.tag.upsert({
            where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
            update: {},
            create: {
              slug: tagName.toLowerCase().replace(/\s+/g, '-'),
              name: tagName,
            },
          });

          // Create post-tag relationship
          return tx.postTag.create({
            data: {
              postId: newPost.id,
              tagId: tag.id,
            },
          });
        });

        await Promise.all(tagPromises);
      }

      return newPost;
    });

    return post;
  }

  async findAll(queryDto: QueryPostsDto) {
    const page = parseInt(queryDto.page || '1');
    const limit = parseInt(queryDto.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      status: 'published',
    };

    // Filter by level
    if (queryDto.level) {
      where.levelId = queryDto.level;
    }

    // Search in title and content
    if (queryDto.q) {
      where.OR = [
        { title: { contains: queryDto.q } },
        { content: { contains: queryDto.q } },
      ];
    }

    // Filter by tag
    if (queryDto.tag) {
      where.postTags = {
        some: {
          tag: {
            slug: queryDto.tag,
          },
        },
      };
    }

    const orderBy =
      queryDto.sort === 'new'
        ? { createdAt: 'desc' as const }
        : { hotScore: 'desc' as const };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          author: {
            include: { profile: true },
          },
          level: true,
          postTags: {
            include: { tag: true },
          },
          postMedia: {
            orderBy: { id: 'asc' },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts.map((post) => ({
        ...post,
        tags: post.postTags.map((pt) => pt.tag),
        media: post.postMedia.map((pm) => ({
          type: pm.kind,
          url: pm.url,
        })),
        commentsCount: post._count.comments,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          include: { profile: true },
        },
        level: true,
        postTags: {
          include: { tag: true },
        },
        postMedia: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      ...post,
      tags: post.postTags.map((pt) => pt.tag),
      media: post.postMedia.map((pm) => ({
        type: pm.kind,
        url: pm.url,
      })),
    };
  }

  async updatePost(id: string, updatePostDto: UpdatePostDto, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true, status: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user can edit this post
    if (post.authorId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { roleId: true },
      });

      if (user?.roleId !== 'admin' && user?.roleId !== 'moderator') {
        throw new ForbiddenException('You can only edit your own posts');
      }
    }

    const { tags, ...postData } = updatePostDto;

    return this.prisma.$transaction(async (tx) => {
      // Update post
      const updatedPost = await tx.post.update({
        where: { id },
        data: {
          ...postData,
          skills: updatePostDto.skills || undefined,
        },
        include: {
          author: { include: { profile: true } },
          level: true,
          postTags: { include: { tag: true } },
        },
      });

      // Handle tags if provided
      if (tags) {
        // Remove existing tags
        await tx.postTag.deleteMany({
          where: { postId: id },
        });

        // Add new tags
        if (tags.length > 0) {
          const tagPromises = tags.map(async (tagName) => {
            const tag = await tx.tag.upsert({
              where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
              update: {},
              create: {
                slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                name: tagName,
              },
            });

            return tx.postTag.create({
              data: {
                postId: id,
                tagId: tag.id,
              },
            });
          });

          await Promise.all(tagPromises);
        }
      }

      return updatedPost;
    });
  }

  async deletePost(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user can delete this post
    if (post.authorId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { roleId: true },
      });

      if (user?.roleId !== 'admin' && user?.roleId !== 'moderator') {
        throw new ForbiddenException('You can only delete your own posts');
      }
    }

    await this.prisma.post.delete({ where: { id } });
    return { message: 'Post deleted successfully' };
  }

  async publishPost(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true, status: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only publish your own posts');
    }

    if (post.status === 'published') {
      throw new ForbiddenException('Post is already published');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
      include: {
        author: { include: { profile: true } },
        level: true,
      },
    });
  }

  // Update user reputation and points (for Growth Hack)
  async updateUserReputation(
    userId: string,
    points: number,
    reputation: number,
  ) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        points: { increment: points },
        reputation: { increment: reputation },
      },
    });
  }
}
