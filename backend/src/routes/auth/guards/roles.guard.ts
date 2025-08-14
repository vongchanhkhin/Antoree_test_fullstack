import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get roles from method and class separately for debugging
    const methodRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    const classRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getClass(),
    );

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    console.log('RolesGuard - DEBUG INFO:');
    console.log('  - Method roles:', methodRoles);
    console.log('  - Class roles:', classRoles);
    console.log('  - Final requiredRoles:', requiredRoles);
    console.log('  - Handler name:', context.getHandler().name);
    console.log('  - Class name:', context.getClass().name);

    if (!requiredRoles) {
      console.log('RolesGuard - no roles required, returning true');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('RolesGuard - user:', user);

    // If no user is available but roles are required, deny access
    if (!user) {
      console.log('RolesGuard - no user found, denying access');
      return false;
    }

    const hasRole = requiredRoles.some((role) => user.roleId === role);
    console.log(
      'RolesGuard - user role check:',
      user.roleId,
      'required:',
      requiredRoles,
      'result:',
      hasRole,
    );
    return hasRole;
  }
}
