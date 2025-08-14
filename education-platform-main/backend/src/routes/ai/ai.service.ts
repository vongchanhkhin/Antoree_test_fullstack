import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { AIAssistRequestDto, AIAssistBatchDto, AIAssistType } from './dto';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  processAIRequest(dto: AIAssistRequestDto) {
    switch (dto.type) {
      case AIAssistType.GRAMMAR_CHECK:
        return this.checkGrammar(dto.content);
      case AIAssistType.CONTENT_SUGGESTIONS:
        return this.getContentSuggestions(
          dto.content,
          dto.context,
          dto.maxSuggestions,
        );
      case AIAssistType.TITLE_SUGGESTIONS:
        return this.getTitleSuggestions(dto.content, dto.maxSuggestions);
      case AIAssistType.SUMMARY:
        return this.generateSummary(dto.content);
      case AIAssistType.TRANSLATION:
        return this.translateContent(dto.content, dto.targetLanguage);
      case AIAssistType.DIFFICULTY_ANALYSIS:
        return this.analyzeDifficulty(dto.content);
      default:
        throw new BadRequestException('Unsupported AI assist type');
    }
  }

  async processBatchRequest(dto: AIAssistBatchDto, userId: string) {
    // Verify post exists and user has access
    const post = await this.prisma.post.findUnique({
      where: { id: dto.postId },
      select: {
        id: true,
        title: true,
        content: true,
        authorId: true,
      },
    });

    if (!post) {
      throw new BadRequestException('Post not found');
    }

    // Check if user is the author or has admin/moderator role
    if (post.authorId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { roleId: true },
      });

      if (!user || !['admin', 'moderator'].includes(user.roleId)) {
        throw new BadRequestException('You can only analyze your own posts');
      }
    }

    const results = {};
    const content = `${post.title}\n\n${post.content}`;

    for (const type of dto.types) {
      try {
        const result = this.processAIRequest({
          type,
          content,
          targetLanguage: dto.targetLanguage,
          maxSuggestions: 5,
        });
        results[type] = result;
      } catch (error) {
        results[type] = { error: error.message };
      }
    }

    return {
      postId: post.id,
      postTitle: post.title,
      results,
      processedAt: new Date().toISOString(),
    };
  }

  private checkGrammar(content: string) {
    // Mock AI grammar checking - replace with actual AI service
    const suggestions = [
      {
        original: 'your wrong',
        suggestion: "you're wrong",
        reason: 'Contraction error',
        position: { start: 10, end: 20 },
      },
      {
        original: 'alot',
        suggestion: 'a lot',
        reason: 'Spelling error',
        position: { start: 25, end: 29 },
      },
    ];

    return {
      type: 'grammar_check',
      originalLength: content.length,
      suggestions,
      score: 85, // Grammar score out of 100
      summary: `Found ${suggestions.length} potential grammar issues`,
    };
  }

  private getContentSuggestions(
    content: string,
    context?: string,
    maxSuggestions = 5,
  ) {
    // Mock AI content suggestions - replace with actual AI service
    const suggestions = [
      {
        type: 'enhancement',
        suggestion: 'Consider adding more examples to illustrate your points',
        relevance: 0.9,
      },
      {
        type: 'structure',
        suggestion: 'Add subheadings to break up long paragraphs',
        relevance: 0.8,
      },
      {
        type: 'engagement',
        suggestion: 'Include questions to encourage reader interaction',
        relevance: 0.7,
      },
    ].slice(0, maxSuggestions);

    return {
      type: 'content_suggestions',
      suggestions,
      context: context || 'general',
      contentLength: content.length,
    };
  }

  private getTitleSuggestions(content: string, maxSuggestions = 5) {
    // Mock AI title suggestions - replace with actual AI service
    const suggestions = [
      {
        title: 'Mastering English Grammar: A Complete Guide',
        score: 0.95,
        reason: 'SEO-friendly and descriptive',
      },
      {
        title: 'The Ultimate English Grammar Reference',
        score: 0.88,
        reason: 'Action-oriented and comprehensive',
      },
      {
        title: 'English Grammar Made Simple',
        score: 0.82,
        reason: 'Clear and accessible',
      },
    ].slice(0, maxSuggestions);

    return {
      type: 'title_suggestions',
      suggestions,
      basedOnContent: content.substring(0, 200) + '...',
    };
  }

  private generateSummary(content: string) {
    // Mock AI summary generation - replace with actual AI service
    const wordCount = content.split(' ').length;
    const summary = content.substring(0, Math.min(200, content.length)) + '...';

    return {
      type: 'summary',
      summary,
      originalWordCount: wordCount,
      summaryWordCount: summary.split(' ').length,
      compressionRatio: (summary.length / content.length).toFixed(2),
      keyPoints: [
        'Main concept introduction',
        'Supporting examples provided',
        'Practical applications discussed',
      ],
    };
  }

  private translateContent(content: string, targetLanguage?: string) {
    if (!targetLanguage) {
      throw new BadRequestException(
        'Target language is required for translation',
      );
    }

    // Mock AI translation - replace with actual AI service
    const translatedContent = `[Translated to ${targetLanguage}] ${content}`;

    return {
      type: 'translation',
      originalLanguage: 'en',
      targetLanguage,
      originalContent: content.substring(0, 100) + '...',
      translatedContent,
      confidence: 0.92,
      wordCount: content.split(' ').length,
    };
  }

  private analyzeDifficulty(content: string) {
    // Mock AI difficulty analysis - replace with actual AI service
    const wordCount = content.split(' ').length;
    const avgWordsPerSentence = wordCount / (content.split('.').length - 1);

    let level = 'intermediate';
    let score = 65;

    if (avgWordsPerSentence < 15) {
      level = 'beginner';
      score = 35;
    } else if (avgWordsPerSentence > 25) {
      level = 'advanced';
      score = 85;
    }

    return {
      type: 'difficulty_analysis',
      level,
      score, // 0-100 scale
      wordCount,
      avgWordsPerSentence: Math.round(avgWordsPerSentence),
      readabilityFactors: {
        sentenceComplexity: avgWordsPerSentence > 20 ? 'high' : 'moderate',
        vocabularyLevel: 'intermediate',
        grammarComplexity: 'moderate',
      },
      recommendations: [
        level === 'advanced'
          ? 'Consider simplifying complex sentences'
          : 'Good complexity level',
        'Add more examples for clarity',
      ],
    };
  }

  getAIUsageStats(userId?: string) {
    // Mock usage statistics - in real implementation, you'd track actual usage
    return {
      totalRequests: 1247,
      requestsByType: {
        grammar_check: 425,
        content_suggestions: 312,
        title_suggestions: 189,
        summary: 156,
        translation: 98,
        difficulty_analysis: 67,
      },
      avgResponseTime: '1.2s',
      userRequests: userId ? 45 : undefined,
      lastRequest: new Date().toISOString(),
    };
  }
}
