import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { SearchDto, SearchType } from './dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(searchDto: SearchDto) {
    const { type, page = '1', limit = '20' } = searchDto;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (type === SearchType.ALL) {
      return this.searchAll(searchDto);
    }

    switch (type) {
      case SearchType.POSTS:
        return this.searchPosts(searchDto, skip, limitNum);
      case SearchType.COMMENTS:
        return this.searchComments(searchDto, skip, limitNum);
      case SearchType.USERS:
        return this.searchUsers(searchDto, skip, limitNum);
      case SearchType.TAGS:
        return this.searchTags(searchDto, skip, limitNum);
      default:
        return this.searchAll(searchDto);
    }
  }

  private async searchAll(searchDto: SearchDto) {
    const { query } = searchDto;

    const [posts, comments, users, tags] = await Promise.all([
      this.searchPosts({ ...searchDto, type: SearchType.POSTS }, 0, 5),
      this.searchComments({ ...searchDto, type: SearchType.COMMENTS }, 0, 5),
      this.searchUsers({ ...searchDto, type: SearchType.USERS }, 0, 5),
      this.searchTags({ ...searchDto, type: SearchType.TAGS }, 0, 5),
    ]);

    return {
      query,
      results: {
        posts: posts.results,
        comments: comments.results,
        users: users.results,
        tags: tags.results,
      },
      counts: {
        posts: posts.total,
        comments: comments.total,
        users: users.total,
        tags: tags.total,
      },
    };
  }

  private async searchPosts(searchDto: SearchDto, skip: number, limit: number) {
    const { query, levelId, skills, tags, sort } = searchDto;

    const where: any = {
      status: 'published',
      OR: [{ title: { contains: query } }, { content: { contains: query } }],
    };

    if (levelId) {
      where.levelId = levelId;
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      where.skills = {
        hasSome: skillsArray,
      };
    }

    if (tags) {
      const tagsArray = tags.split(',').map((t) => t.trim());
      where.postTags = {
        some: {
          tag: {
            slug: { in: tagsArray },
          },
        },
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'votes') {
      orderBy = { upvotes: 'desc' };
    }

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
      results: posts.map((post) => ({
        ...post,
        tags: post.postTags.map((pt) => pt.tag),
        commentsCount: post._count.comments,
      })),
      total,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async searchComments(
    searchDto: SearchDto,
    skip: number,
    limit: number,
  ) {
    const { query, sort } = searchDto;

    const where: any = {
      content: { contains: query },
    };

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'votes') {
      orderBy = { upvotes: 'desc' };
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        include: {
          author: {
            include: { profile: true },
          },
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      results: comments,
      total,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async searchUsers(searchDto: SearchDto, skip: number, limit: number) {
    const { query } = searchDto;

    const where: any = {
      OR: [
        { email: { contains: query } },
        {
          profile: {
            OR: [
              { username: { contains: query } },
              { displayName: { contains: query } },
              { bio: { contains: query } },
            ],
          },
        },
      ],
    };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          profile: true,
          role: true,
          _count: {
            select: {
              posts: true,
              comments: true,
            },
          },
        },
        orderBy: {
          profile: {
            points: 'desc',
          },
        },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      results: users.map((user) => ({
        ...user,
        postsCount: user._count.posts,
        commentsCount: user._count.comments,
      })),
      total,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async searchTags(searchDto: SearchDto, skip: number, limit: number) {
    const { query } = searchDto;

    const where: any = {
      OR: [
        { name: { contains: query } },
        { slug: { contains: query } },
        { description: { contains: query } },
      ],
    };

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
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
        skip,
        take: limit,
      }),
      this.prisma.tag.count({ where }),
    ]);

    return {
      results: tags.map((tag) => ({
        ...tag,
        postsCount: tag._count.postTags,
      })),
      total,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSuggestions(query: string, limit = 10) {
    const [posts, users, tags] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          status: 'published',
          title: { contains: query },
        },
        select: {
          id: true,
          title: true,
        },
        take: Math.floor(limit / 3),
      }),
      this.prisma.user.findMany({
        where: {
          profile: {
            OR: [
              { username: { contains: query } },
              { displayName: { contains: query } },
            ],
          },
        },
        select: {
          id: true,
          profile: {
            select: {
              username: true,
              displayName: true,
            },
          },
        },
        take: Math.floor(limit / 3),
      }),
      this.prisma.tag.findMany({
        where: {
          OR: [{ name: { contains: query } }, { slug: { contains: query } }],
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: Math.floor(limit / 3),
      }),
    ]);

    return {
      posts: posts.map((p) => ({ ...p, type: 'post' })),
      users: users.map((u) => ({ ...u, type: 'user' })),
      tags: tags.map((t) => ({ ...t, type: 'tag' })),
    };
  }
}
