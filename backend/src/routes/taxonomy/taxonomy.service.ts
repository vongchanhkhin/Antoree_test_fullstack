import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { CreateTagDto, UpdateTagDto, QueryTagsDto } from './dto';

@Injectable()
export class TaxonomyService {
  constructor(private prisma: PrismaService) {}

  async createTag(createTagDto: CreateTagDto) {
    // Check if slug already exists
    const existingTag = await this.prisma.tag.findUnique({
      where: { slug: createTagDto.slug },
    });

    if (existingTag) {
      throw new ConflictException('Tag with this slug already exists');
    }

    return this.prisma.tag.create({
      data: createTagDto,
    });
  }

  async findAll(queryDto: QueryTagsDto) {
    const page = parseInt(queryDto.page || '1');
    const limit = parseInt(queryDto.limit || '50');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (queryDto.search) {
      where.OR = [
        { name: { contains: queryDto.search } },
        { description: { contains: queryDto.search } },
      ];
    }

    let orderBy: any = { name: 'asc' };
    if (queryDto.sort === 'posts') {
      orderBy = { postTags: { _count: 'desc' } };
    } else if (queryDto.sort === 'created') {
      orderBy = { createdAt: 'desc' };
    }

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        include: {
          _count: {
            select: { postTags: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.tag.count({ where }),
    ]);

    return {
      tags: tags.map((tag) => ({
        ...tag,
        postsCount: tag._count.postTags,
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
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        postTags: {
          include: {
            post: {
              include: {
                author: {
                  include: { profile: true },
                },
                level: true,
              },
            },
          },
          take: 10, // Latest 10 posts with this tag
          orderBy: { post: { createdAt: 'desc' } },
        },
        _count: {
          select: { postTags: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return {
      ...tag,
      postsCount: tag._count.postTags,
      posts: tag.postTags.map((pt) => pt.post),
    };
  }

  async findBySlug(slug: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { slug },
      include: {
        postTags: {
          include: {
            post: {
              include: {
                author: {
                  include: { profile: true },
                },
                level: true,
              },
            },
          },
          orderBy: { post: { createdAt: 'desc' } },
        },
        _count: {
          select: { postTags: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return {
      ...tag,
      postsCount: tag._count.postTags,
      posts: tag.postTags.map((pt) => pt.post),
    };
  }

  async updateTag(id: string, updateTagDto: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check if new slug conflicts (if slug is being updated)
    if (updateTagDto.slug && updateTagDto.slug !== tag.slug) {
      const existingTag = await this.prisma.tag.findUnique({
        where: { slug: updateTagDto.slug },
      });

      if (existingTag) {
        throw new ConflictException('Tag with this slug already exists');
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: updateTagDto,
    });
  }

  async deleteTag(id: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { postTags: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag._count.postTags > 0) {
      throw new ConflictException(
        'Cannot delete tag that is associated with posts',
      );
    }

    await this.prisma.tag.delete({ where: { id } });
    return { message: 'Tag deleted successfully' };
  }

  async getPopularTags(limit = 20) {
    const tags = await this.prisma.tag.findMany({
      include: {
        _count: {
          select: { postTags: true },
        },
      },
      orderBy: {
        postTags: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return tags.map((tag) => ({
      ...tag,
      postsCount: tag._count.postTags,
    }));
  }

  async searchTags(query: string, limit = 10) {
    const tags = await this.prisma.tag.findMany({
      where: {
        OR: [{ name: { contains: query } }, { slug: { contains: query } }],
      },
      include: {
        _count: {
          select: { postTags: true },
        },
      },
      orderBy: {
        postTags: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return tags.map((tag) => ({
      ...tag,
      postsCount: tag._count.postTags,
    }));
  }
}
