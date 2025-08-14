import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/services/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(roleId?: string) {
    const where = roleId ? { roleId } : {};

    return this.prisma.user.findMany({
      where,
      include: {
        profile: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
        },
        role: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            levelId: true,
            points: true,
            reputation: true,
          },
        },
        role: {
          select: {
            id: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user and profile in a transaction
    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          email: updateUserDto.email,
          roleId: updateUserDto.roleId,
        },
        include: {
          profile: true,
          role: true,
        },
      });

      // Update profile if needed
      if (
        updateUserDto.displayName ||
        updateUserDto.bio ||
        updateUserDto.avatarUrl ||
        updateUserDto.levelId
      ) {
        await tx.profile.update({
          where: { userId: id },
          data: {
            displayName: updateUserDto.displayName,
            bio: updateUserDto.bio,
            avatarUrl: updateUserDto.avatarUrl,
            levelId: updateUserDto.levelId,
          },
        });
      }

      return updatedUser;
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  async getTeachers() {
    return this.findAll('teacher');
  }

  async getLearners() {
    return this.findAll('learner');
  }

  async getModerators() {
    return this.findAll('moderator');
  }

  async updateProfile(userId: string, updateData: any) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update profile
    await this.prisma.profile.update({
      where: { userId },
      data: {
        displayName: updateData.displayName,
        bio: updateData.bio,
        avatarUrl: updateData.avatarUrl,
        levelId: updateData.levelId,
      },
    });

    // Return updated user with profile
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        role: true,
      },
    });
  }
}
