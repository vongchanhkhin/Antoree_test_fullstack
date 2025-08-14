import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../shared/services/prisma.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET,
        });

        const user = await this.prisma.user.findUnique({
          where: { id: payload.sub },
          include: {
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
                bio: true,
              },
            },
          },
        });

        if (user) {
          console.log('JWT Middleware: User found', user);
          (req as any).user = user;
        }
      } catch (error) {
        console.error('JWT Middleware: Invalid token', error);
      }
    }

    next();
  }
}
