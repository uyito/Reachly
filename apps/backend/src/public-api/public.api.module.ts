import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from '@reachly/backend/services/auth/auth.service';
import { StripeService } from '@reachly/nestjs-libraries/services/stripe.service';
import { PoliciesGuard } from '@reachly/backend/services/auth/permissions/permissions.guard';
import { PermissionsService } from '@reachly/backend/services/auth/permissions/permissions.service';
import { IntegrationManager } from '@reachly/nestjs-libraries/integrations/integration.manager';
import { UploadModule } from '@reachly/nestjs-libraries/upload/upload.module';
import { OpenaiService } from '@reachly/nestjs-libraries/openai/openai.service';
import { ExtractContentService } from '@reachly/nestjs-libraries/openai/extract.content.service';
import { CodesService } from '@reachly/nestjs-libraries/services/codes.service';
import { PublicIntegrationsController } from '@reachly/backend/public-api/routes/v1/public.integrations.controller';
import { PublicAuthMiddleware } from '@reachly/backend/services/auth/public.auth.middleware';
import { SuperAdminGuard } from '@reachly/backend/services/auth/super.admin.guard';

const authenticatedController = [PublicIntegrationsController];
@Module({
  imports: [UploadModule],
  controllers: process.env.MCP_ONLY ? [] : [...authenticatedController],
  providers: [
    AuthService,
    StripeService,
    OpenaiService,
    ExtractContentService,
    PoliciesGuard,
    PermissionsService,
    CodesService,
    IntegrationManager,
    SuperAdminGuard,
  ],
  get exports() {
    return [...this.imports, ...this.providers];
  },
})
export class PublicApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PublicAuthMiddleware).forRoutes(...authenticatedController);
  }
}

