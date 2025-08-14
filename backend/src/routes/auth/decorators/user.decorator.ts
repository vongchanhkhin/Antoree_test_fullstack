import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface RequestUser {
  id: string;
  email: string;
  roleId: string;
}

export const User = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as RequestUser;

    return data ? user?.[data] : user;
  },
);
