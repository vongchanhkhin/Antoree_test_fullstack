import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../shared/services/prisma.service';
import { SignUpDto, SignInDto, RefreshTokenDto } from './dto';
import { UserRole } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const {
      email,
      password,
      name,
      role = UserRole.Learner,
      bio,
      avatar,
      provider = 'local',
      providerId,
    } = signUpDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          provider,
          providerId: providerId || email,
          roleId: role,
        },
        select: {
          id: true,
          email: true,
          roleId: true,
          provider: true,
          createdAt: true,
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          displayName: name,
          bio,
          avatarUrl: avatar,
        },
      });

      return { user, profile };
    });

    const tokens = await this.generateTokens(result.user.id);

    return {
      user: result.user,
      profile: result.profile,
      ...tokens,
    };
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto;

    // Find user with profile
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      (user.passwordHash as string) || '',
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const tokens = await this.generateTokens(payload.sub as string);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  logout(_refreshTokenDto: RefreshTokenDto) {
    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  getRoles() {
    return this.prisma.role.findMany({
      select: {
        id: true,
        description: true,
      },
    });
  }

  private async generateTokens(userId: string) {
    const payload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
