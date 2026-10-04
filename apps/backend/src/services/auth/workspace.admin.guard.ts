import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

// Administrator checks must also apply to self-hosted installs, where billing
// policies intentionally allow all sections regardless of workspace role.
@Injectable()
export class WorkspaceAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const membership = request.org?.users?.find(
      (member: { userId: string }) => member.userId === request.user?.id
    );
    if (
      !membership ||
      membership.disabled ||
      !['ADMIN', 'SUPERADMIN'].includes(membership.role)
    ) {
      throw new ForbiddenException(
        'Only workspace administrators can manage agent publishing.'
      );
    }
    return true;
  }
}
