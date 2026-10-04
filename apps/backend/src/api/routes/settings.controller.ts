import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetOrgFromRequest } from '@reachly/nestjs-libraries/user/org.from.request';
import { GetUserFromRequest } from '@reachly/nestjs-libraries/user/user.from.request';
import { Organization, User } from '@prisma/client';
import { CheckPolicies } from '@reachly/backend/services/auth/permissions/permissions.ability';
import { OrganizationService } from '@reachly/nestjs-libraries/database/prisma/organizations/organization.service';
import { IntegrationService } from '@reachly/nestjs-libraries/database/prisma/integrations/integration.service';
import { WorkspaceAdminGuard } from '@reachly/backend/services/auth/workspace.admin.guard';
import { AddTeamMemberDto } from '@reachly/nestjs-libraries/dtos/settings/add.team.member.dto';
import { AdminAddTeamMemberDto } from '@reachly/nestjs-libraries/dtos/settings/admin.add.team.member.dto';
import { ShortlinkPreferenceDto } from '@reachly/nestjs-libraries/dtos/settings/shortlink-preference.dto';
import { ApiTags } from '@nestjs/swagger';
import {
  AuthorizationActions,
  Sections,
} from '@reachly/backend/services/auth/permissions/permission.exception.class';

@ApiTags('Settings')
@Controller('/settings')
export class SettingsController {
  constructor(
    private _organizationService: OrganizationService,
    private _integrationService: IntegrationService
  ) {}

  @Get('/agent-publishing')
  @UseGuards(WorkspaceAdminGuard)
  @Header('Cache-Control', 'no-store')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async getAgentPublishing(@GetOrgFromRequest() org: Organization) {
    const [hasToken, integrations] = await Promise.all([
      this._organizationService.hasAgentMcpToken(org.id),
      this._integrationService.getIntegrationsList(org.id),
    ]);
    return {
      hasToken,
      accounts: integrations.map((p) => ({
        id: p.id,
        name: p.name,
        platform: p.providerIdentifier,
        picture: p.picture,
        agentPublishingEnabled: p.agentPublishingEnabled,
        available: !p.disabled && !p.refreshNeeded && !p.inBetweenSteps,
      })),
    };
  }

  @Post('/agent-publishing/token')
  @UseGuards(WorkspaceAdminGuard)
  @Header('Cache-Control', 'no-store')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  rotateAgentToken(@GetOrgFromRequest() org: Organization) {
    return this._organizationService.rotateAgentMcpToken(org.id);
  }

  @Delete('/agent-publishing/token')
  @UseGuards(WorkspaceAdminGuard)
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  revokeAgentToken(@GetOrgFromRequest() org: Organization) {
    return this._organizationService.revokeAgentMcpToken(org.id);
  }

  @Get('/team')
  @CheckPolicies(
    [AuthorizationActions.Create, Sections.TEAM_MEMBERS],
    [AuthorizationActions.Create, Sections.ADMIN]
  )
  async getTeam(@GetOrgFromRequest() org: Organization) {
    return this._organizationService.getTeam(org.id);
  }

  @Post('/team')
  @CheckPolicies(
    [AuthorizationActions.Create, Sections.TEAM_MEMBERS],
    [AuthorizationActions.Create, Sections.ADMIN]
  )
  async inviteTeamMember(
    @GetOrgFromRequest() org: Organization,
    @GetUserFromRequest() user: User,
    @Body() body: AddTeamMemberDto
  ) {
    return this._organizationService.inviteTeamMember(org, user, body);
  }

  @Post('/team/add')
  async addTeamMember(
    @GetUserFromRequest() user: User,
    @GetOrgFromRequest() org: Organization,
    @Body() body: AdminAddTeamMemberDto
  ) {
    if (!user.isSuperAdmin) {
      throw new HttpException('Unauthorized', 400);
    }

    return this._organizationService.addTeamMemberByEmail(org, body);
  }

  @Delete('/team/:id')
  @CheckPolicies(
    [AuthorizationActions.Create, Sections.TEAM_MEMBERS],
    [AuthorizationActions.Create, Sections.ADMIN]
  )
  deleteTeamMember(
    @GetOrgFromRequest() org: Organization,
    @Param('id') id: string
  ) {
    return this._organizationService.deleteTeamMember(org, id);
  }

  @Get('/shortlink')
  async getShortlinkPreference(@GetOrgFromRequest() org: Organization) {
    return this._organizationService.getShortlinkPreference(org.id);
  }

  @Post('/shortlink')
  @CheckPolicies([AuthorizationActions.Create, Sections.ADMIN])
  async updateShortlinkPreference(
    @GetOrgFromRequest() org: Organization,
    @Body() body: ShortlinkPreferenceDto
  ) {
    return this._organizationService.updateShortlinkPreference(
      org.id,
      body.shortlink
    );
  }
}
