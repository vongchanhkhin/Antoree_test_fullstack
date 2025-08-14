import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../shared/services/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - validating payload:', payload);

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

    console.log('JWT Strategy - user found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('JWT Strategy - throwing UnauthorizedException');
      throw new UnauthorizedException('User not found');
    }

    const result = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      profile: user.profile,
    };

    console.log('JWT Strategy - returning user:', result);
    return result;
  }
}
