import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthController } from '@reachly/backend/api/routes/auth.controller';
import { AuthService } from '@reachly/backend/services/auth/auth.service';
import { UsersController } from '@reachly/backend/api/routes/users.controller';
import { AuthMiddleware } from '@reachly/backend/services/auth/auth.middleware';
import { StripeService } from '@reachly/nestjs-libraries/services/stripe.service';
import { PaymentController } from '@reachly/backend/api/routes/payment.controller';
import { PaymentService } from '@reachly/nestjs-libraries/services/payment/payment.service';
import { PaymentProviderManager } from '@reachly/nestjs-libraries/services/payment/payment.provider.manager';
import { RevenueCatProvider } from '@reachly/nestjs-libraries/services/payment/providers/revenuecat.provider';
import { AnalyticsController } from '@reachly/backend/api/routes/analytics.controller';
import { PoliciesGuard } from '@reachly/backend/services/auth/permissions/permissions.guard';
import { PermissionsService } from '@reachly/backend/services/auth/permissions/permissions.service';
import { IntegrationsController } from '@reachly/backend/api/routes/integrations.controller';
import { IntegrationManager } from '@reachly/nestjs-libraries/integrations/integration.manager';
import { SettingsController } from '@reachly/backend/api/routes/settings.controller';
import { PostsController } from '@reachly/backend/api/routes/posts.controller';
import { MediaController } from '@reachly/backend/api/routes/media.controller';
import { ClippingController } from '@reachly/backend/api/routes/clipping.controller';
import { MediaWidgetController } from '@reachly/backend/api/routes/media.widget.controller';
import { UploadWidgetAuthMiddleware } from '@reachly/backend/services/auth/upload.widget.auth.middleware';
import { ClippingWidgetController } from '@reachly/backend/api/routes/clipping.widget.controller';
import { ClippingWidgetAuthMiddleware } from '@reachly/backend/services/auth/clipping.widget.auth.middleware';
import { UploadModule } from '@reachly/nestjs-libraries/upload/upload.module';
import { BillingController } from '@reachly/backend/api/routes/billing.controller';
import { NotificationsController } from '@reachly/backend/api/routes/notifications.controller';
import { OpenaiService } from '@reachly/nestjs-libraries/openai/openai.service';
import { ExtractContentService } from '@reachly/nestjs-libraries/openai/extract.content.service';
import { CodesService } from '@reachly/nestjs-libraries/services/codes.service';
import { CopilotController } from '@reachly/backend/api/routes/copilot.controller';
import { PublicController } from '@reachly/backend/api/routes/public.controller';
import { RootController } from '@reachly/backend/api/routes/root.controller';
import { TrackService } from '@reachly/nestjs-libraries/track/track.service';
import { ShortLinkService } from '@reachly/nestjs-libraries/short-linking/short.link.service';
import { WebhookController } from '@reachly/backend/api/routes/webhooks.controller';
import { SignatureController } from '@reachly/backend/api/routes/signature.controller';
import { AutopostController } from '@reachly/backend/api/routes/autopost.controller';
import { SetsController } from '@reachly/backend/api/routes/sets.controller';
import { ThirdPartyController } from '@reachly/backend/api/routes/third-party.controller';
import { MonitorController } from '@reachly/backend/api/routes/monitor.controller';
import { NoAuthIntegrationsController } from '@reachly/backend/api/routes/no.auth.integrations.controller';
import { EnterpriseController } from '@reachly/backend/api/routes/enterprise.controller';
import { OAuthAppController } from '@reachly/backend/api/routes/oauth-app.controller';
import { ApprovedAppsController } from '@reachly/backend/api/routes/approved-apps.controller';
import {
  OAuthController,
  OAuthAuthorizedController,
} from '@reachly/backend/api/routes/oauth.controller';
import { AnnouncementsController } from '@reachly/backend/api/routes/announcements.controller';
import { AdminController } from '@reachly/backend/api/routes/admin.controller';
import { AuthProviderManager } from '@reachly/backend/services/auth/providers/providers.manager';
import { GithubProvider } from '@reachly/backend/services/auth/providers/github.provider';
import { GoogleProvider } from '@reachly/backend/services/auth/providers/google.provider';
import { AppleProvider } from '@reachly/backend/services/auth/providers/apple.provider';
import { FarcasterProvider } from '@reachly/backend/services/auth/providers/farcaster.provider';
import { WalletProvider } from '@reachly/backend/services/auth/providers/wallet.provider';
import { OauthProvider } from '@reachly/backend/services/auth/providers/oauth.provider';
import { StripeController } from '@reachly/backend/api/routes/stripe.controller';

const authenticatedController = [
  UsersController,
  AnalyticsController,
  IntegrationsController,
  SettingsController,
  PostsController,
  MediaController,
  ClippingController,
  BillingController,
  NotificationsController,
  CopilotController,
  WebhookController,
  SignatureController,
  AutopostController,
  SetsController,
  ThirdPartyController,
  OAuthAppController,
  ApprovedAppsController,
  OAuthAuthorizedController,
  AnnouncementsController,
  AdminController,
];
@Module({
  imports: [UploadModule],
  controllers: process.env.MCP_ONLY
    ? [
        RootController,
        OAuthController,
        MediaWidgetController,
        ClippingWidgetController,
      ]
    : [
        RootController,
        PaymentController,
        StripeController,
        AuthController,
        PublicController,
        MonitorController,
        EnterpriseController,
        NoAuthIntegrationsController,
        OAuthController,
        MediaWidgetController,
        ClippingWidgetController,
        ...authenticatedController,
      ],
  providers: [
    AuthService,
    StripeService,
    PaymentService,
    PaymentProviderManager,
    RevenueCatProvider,
    OpenaiService,
    ExtractContentService,
    AuthMiddleware,
    UploadWidgetAuthMiddleware,
    PoliciesGuard,
    PermissionsService,
    CodesService,
    IntegrationManager,
    TrackService,
    ShortLinkService,
    AuthProviderManager,
    GithubProvider,
    GoogleProvider,
    AppleProvider,
    FarcasterProvider,
    WalletProvider,
    OauthProvider,
  ],
  get exports() {
    return [...this.imports, ...this.providers];
  },
})
export class ApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(...authenticatedController);
    consumer.apply(UploadWidgetAuthMiddleware).forRoutes(MediaWidgetController);
    consumer
      .apply(ClippingWidgetAuthMiddleware)
      .forRoutes(ClippingWidgetController);
  }
}
