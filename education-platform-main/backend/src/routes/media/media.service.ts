import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import {
  CreatePostMediaDto,
  QueryPostMediaDto,
  UpdatePostMediaDto,
  MediaKind,
} from './dto';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async createPostMedia(dto: CreatePostMediaDto) {
    // Validate that the post exists
    const post = await this.prisma.post.findUnique({
      where: { id: dto.postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Validate URL format for media kind
    this.validateUrlForKind(dto.url, dto.kind);

    // Prepare metadata
    const meta = {
      uploadedAt: new Date().toISOString(),
      kind: dto.kind,
      ...dto.meta,
    };

    // Save to database
    const postMedia = await this.prisma.postMedia.create({
      data: {
        postId: dto.postId,
        kind: dto.kind,
        url: dto.url,
        meta,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return postMedia;
  }

  async getPostMedia(query: QueryPostMediaDto) {
    const { postId, kind, search, limit = '10', offset = '0' } = query;

    const where: any = {};

    if (postId) {
      where.postId = postId;
    }

    if (kind) {
      where.kind = kind;
    }

    if (search) {
      where.post = {
        title: {
          contains: search,
          mode: 'insensitive',
        },
      };
    }

    const [postMedia, total] = await Promise.all([
      this.prisma.postMedia.findMany({
        where,
        include: {
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        take: parseInt(limit),
        skip: parseInt(offset),
        orderBy: {
          id: 'desc',
        },
      }),
      this.prisma.postMedia.count({ where }),
    ]);

    return {
      data: postMedia,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
    };
  }

  async getPostMediaById(id: string) {
    const postMedia = await this.prisma.postMedia.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!postMedia) {
      throw new NotFoundException('Post media not found');
    }

    return postMedia;
  }

  async updatePostMedia(id: string, dto: UpdatePostMediaDto) {
    const postMedia = await this.prisma.postMedia.findUnique({
      where: { id },
    });

    if (!postMedia) {
      throw new NotFoundException('Post media not found');
    }

    // If URL is being updated, validate it for the new or existing kind
    if (dto.url || dto.kind) {
      const kind = dto.kind || (postMedia.kind as MediaKind);
      const url = dto.url || postMedia.url;
      this.validateUrlForKind(url, kind);
    }

    // Prepare updated metadata
    const currentMeta = (postMedia.meta as any) || {};
    const updatedMeta = {
      ...currentMeta,
      ...dto.meta,
      updatedAt: new Date().toISOString(),
    };

    const updatedPostMedia = await this.prisma.postMedia.update({
      where: { id },
      data: {
        ...(dto.kind && { kind: dto.kind }),
        ...(dto.url && { url: dto.url }),
        meta: updatedMeta,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return updatedPostMedia;
  }

  async deletePostMedia(id: string) {
    const postMedia = await this.prisma.postMedia.findUnique({
      where: { id },
    });

    if (!postMedia) {
      throw new NotFoundException('Post media not found');
    }

    // Delete from database (no file system cleanup needed since files are on Cloudinary)
    await this.prisma.postMedia.delete({
      where: { id },
    });

    return { message: 'Post media deleted successfully' };
  }

  async getPostMediaByPostId(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const postMedia = await this.prisma.postMedia.findMany({
      where: { postId },
      orderBy: {
        id: 'desc',
      },
    });

    return postMedia;
  }

  async getMediaStats() {
    const stats = await this.prisma.postMedia.groupBy({
      by: ['kind'],
      _count: { kind: true },
    });

    const totalCount = await this.prisma.postMedia.count();

    const result = {
      totalFiles: totalCount,
      byKind: {} as Record<string, number>,
    };

    stats.forEach((stat) => {
      result.byKind[stat.kind] = stat._count.kind;
    });

    return result;
  }

  private validateUrlForKind(url: string, kind: MediaKind): void {
    // Basic URL validation for different media types
    // This is a simple validation - you might want to make it more robust

    if (kind === MediaKind.IMAGE) {
      // Check if URL looks like an image (common Cloudinary patterns)
      if (
        !url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$)/i) &&
        !url.includes('cloudinary.com') &&
        !url.includes('image/upload')
      ) {
        throw new BadRequestException(
          'URL does not appear to be a valid image',
        );
      }
    } else if (kind === MediaKind.VIDEO) {
      // Check if URL looks like a video
      if (
        !url.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv)(\?|$)/i) &&
        !url.includes('cloudinary.com') &&
        !url.includes('video/upload')
      ) {
        throw new BadRequestException(
          'URL does not appear to be a valid video',
        );
      }
    } else if (kind === MediaKind.AUDIO) {
      // Check if URL looks like audio
      if (
        !url.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma)(\?|$)/i) &&
        !url.includes('cloudinary.com') &&
        !url.includes('auto/upload')
      ) {
        throw new BadRequestException(
          'URL does not appear to be a valid audio file',
        );
      }
    }
  }
}
