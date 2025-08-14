import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import {
  CreateArtifactDto,
  CreateQuizDto,
  CreateFlashcardsDto,
  QueryArtifactsDto,
  SubmitQuizDto,
  ArtifactStatus,
} from './dto';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  async createArtifact(dto: CreateArtifactDto, createdBy: string) {
    // Validate post exists if postId is provided
    if (dto.postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: dto.postId },
      });

      if (!post) {
        throw new NotFoundException('Post not found');
      }
    }

    const artifact = await this.prisma.artifact.create({
      data: {
        postId: dto.postId,
        type: dto.type as any,
        status: ArtifactStatus.READY as any,
        meta: {
          title: dto.title,
          description: dto.description,
          createdAt: new Date().toISOString(),
        },
        createdBy,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        creator: {
          include: { profile: true },
        },
      },
    });

    return artifact;
  }

  async getArtifacts(query: QueryArtifactsDto) {
    const {
      postId,
      type,
      status,
      createdBy,
      search,
      page = '1',
      limit = '20',
    } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (postId) {
      where.postId = postId;
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (createdBy) {
      where.createdBy = createdBy;
    }
    if (search) {
      where.OR = [
        {
          meta: {
            path: ['title'],
            string_contains: search,
          },
        },
        {
          meta: {
            path: ['description'],
            string_contains: search,
          },
        },
      ];
    }

    const [artifacts, total] = await Promise.all([
      this.prisma.artifact.findMany({
        where,
        include: {
          post: {
            select: {
              id: true,
              title: true,
            },
          },
          creator: {
            include: { profile: true },
          },
          _count: {
            select: {
              quizQuestions: true,
              flashcards: true,
              quizSubmissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.artifact.count({ where }),
    ]);

    return {
      data: artifacts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getArtifactById(id: string) {
    const artifact = await this.prisma.artifact.findUnique({
      where: { id },
      include: {
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        creator: {
          include: { profile: true },
        },
        quizQuestions: {
          include: {
            options: true,
          },
          orderBy: { orderNo: 'asc' },
        },
        flashcards: {
          orderBy: { orderNo: 'asc' },
        },
        _count: {
          select: {
            quizSubmissions: true,
          },
        },
      },
    });

    if (!artifact) {
      throw new NotFoundException('Artifact not found');
    }

    return artifact;
  }

  async createQuiz(dto: CreateQuizDto, userId: string) {
    const artifact = await this.validateArtifactAccess(dto.artifactId, userId);

    if (artifact.type !== 'quiz') {
      throw new BadRequestException('Artifact is not a quiz type');
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      // Delete existing questions if any
      await prisma.quizQuestion.deleteMany({
        where: { artifactId: dto.artifactId },
      });

      // Create new questions with options
      const questions: any[] = [];
      for (const questionDto of dto.questions) {
        const question = await prisma.quizQuestion.create({
          data: {
            artifactId: dto.artifactId,
            stem: questionDto.stem,
            explanation: questionDto.explanation,
            orderNo: questionDto.orderNo,
          },
        });

        await prisma.quizOption.createMany({
          data: questionDto.options.map((option) => ({
            questionId: question.id,
            content: option.content,
            isCorrect: option.isCorrect,
          })),
        });

        questions.push(question);
      }

      return questions;
    });

    return {
      artifactId: dto.artifactId,
      questionsCreated: result.length,
      questions: result,
    };
  }

  async createFlashcards(dto: CreateFlashcardsDto, userId: string) {
    const artifact = await this.validateArtifactAccess(dto.artifactId, userId);

    if (artifact.type !== 'flashcards') {
      throw new BadRequestException('Artifact is not a flashcards type');
    }

    const result = await this.prisma.$transaction(async (prisma) => {
      // Delete existing flashcards if any
      await prisma.flashcard.deleteMany({
        where: { artifactId: dto.artifactId },
      });

      // Create new flashcards
      const flashcards = await prisma.flashcard.createMany({
        data: dto.flashcards.map((card) => ({
          artifactId: dto.artifactId,
          front: card.front,
          back: card.back,
          example: card.example,
          orderNo: card.orderNo,
        })),
      });

      return flashcards;
    });

    return {
      artifactId: dto.artifactId,
      flashcardsCreated: result.count,
    };
  }

  async submitQuiz(artifactId: string, dto: SubmitQuizDto, userId: string) {
    const artifact = await this.prisma.artifact.findUnique({
      where: { id: artifactId },
      include: {
        quizQuestions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!artifact) {
      throw new NotFoundException('Artifact not found');
    }

    if (artifact.type !== 'quiz') {
      throw new BadRequestException('Artifact is not a quiz');
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = artifact.quizQuestions.length;
    const answerDetails: any[] = [];

    for (const answer of dto.answers) {
      const question = artifact.quizQuestions.find(
        (q) => q.id === answer.questionId,
      );
      if (!question) continue;

      const correctOptions = question.options.filter((opt) => opt.isCorrect);
      const correctOptionIds = correctOptions.map((opt) => opt.id);

      const isCorrect =
        answer.selectedOptions.length === correctOptionIds.length &&
        answer.selectedOptions.every((optId) =>
          correctOptionIds.includes(optId),
        );

      if (isCorrect) {
        correctAnswers++;
      }

      answerDetails.push({
        questionId: answer.questionId,
        selectedOptions: answer.selectedOptions,
        correctOptions: correctOptionIds,
        isCorrect,
      });
    }

    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Save submission
    const submission = await this.prisma.quizSubmission.create({
      data: {
        artifactId,
        userId,
        score,
        answers: {
          details: answerDetails,
          submittedAt: new Date().toISOString(),
        },
      },
      include: {
        artifact: {
          select: {
            id: true,
            type: true,
            meta: true,
          },
        },
        user: {
          include: { profile: true },
        },
      },
    });

    return {
      submissionId: submission.id,
      score: parseFloat(score.toFixed(2)),
      correctAnswers,
      totalQuestions,
      percentage: parseFloat(
        ((correctAnswers / totalQuestions) * 100).toFixed(1),
      ),
      answerDetails,
      submittedAt: submission.createdAt,
    };
  }

  async getUserSubmissions(userId: string, artifactId?: string) {
    const where: any = { userId };
    if (artifactId) {
      where.artifactId = artifactId;
    }

    const submissions = await this.prisma.quizSubmission.findMany({
      where,
      include: {
        artifact: {
          select: {
            id: true,
            type: true,
            meta: true,
            post: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions;
  }

  async getLearningStats(userId?: string) {
    const where = userId ? { createdBy: userId } : {};

    const [totalArtifacts, artifactsByType, totalSubmissions, avgScores] =
      await Promise.all([
        this.prisma.artifact.count({ where }),
        this.prisma.artifact.groupBy({
          by: ['type'],
          where,
          _count: { type: true },
        }),
        this.prisma.quizSubmission.count(
          userId ? { where: { userId } } : undefined,
        ),
        this.prisma.quizSubmission.aggregate({
          where: userId ? { userId } : {},
          _avg: { score: true },
          _max: { score: true },
        }),
      ]);

    const typeStats = artifactsByType.reduce(
      (acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalArtifacts,
      artifactsByType: typeStats,
      totalSubmissions,
      averageScore: avgScores._avg.score
        ? parseFloat(avgScores._avg.score.toFixed(2))
        : 0,
      bestScore: avgScores._max.score
        ? parseFloat(avgScores._max.score.toFixed(2))
        : 0,
    };
  }

  private async validateArtifactAccess(artifactId: string, userId: string) {
    const artifact = await this.prisma.artifact.findUnique({
      where: { id: artifactId },
      include: {
        creator: {
          select: { roleId: true },
        },
      },
    });

    if (!artifact) {
      throw new NotFoundException('Artifact not found');
    }

    // Check if user is the creator or has admin/moderator role
    if (artifact.createdBy !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { roleId: true },
      });

      if (!user || !['admin', 'moderator'].includes(user.roleId)) {
        throw new ForbiddenException('You can only modify your own artifacts');
      }
    }

    return artifact;
  }
}
