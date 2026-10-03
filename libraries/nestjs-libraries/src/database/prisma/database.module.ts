import { Global, Module } from '@nestjs/common';
import { PrismaRepository, PrismaService, PrismaTransaction } from './prisma.service';
import { OrganizationRepository } from '@reachly/nestjs-libraries/database/prisma/organizations/organization.repository';
import { OrganizationService } from '@reachly/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@reachly/nestjs-libraries/database/prisma/users/users.service';
import { UsersRepository } from '@reachly/nestjs-libraries/database/prisma/users/users.repository';
import { SubscriptionService } from '@reachly/nestjs-libraries/database/prisma/subscriptions/subscription.service';
import { SubscriptionRepository } from '@reachly/nestjs-libraries/database/prisma/subscriptions/subscription.repository';
import { NotificationService } from '@reachly/nestjs-libraries/database/prisma/notifications/notification.service';
import { IntegrationService } from '@reachly/nestjs-libraries/database/prisma/integrations/integration.service';
import { IntegrationRepository } from '@reachly/nestjs-libraries/database/prisma/integrations/integration.repository';
import { PostsService } from '@reachly/nestjs-libraries/database/prisma/posts/posts.service';
import { PostsRepository } from '@reachly/nestjs-libraries/database/prisma/posts/posts.repository';
import { IntegrationManager } from '@reachly/nestjs-libraries/integrations/integration.manager';
import { MediaService } from '@reachly/nestjs-libraries/database/prisma/media/media.service';
import { MediaRepository } from '@reachly/nestjs-libraries/database/prisma/media/media.repository';
import { NotificationsRepository } from '@reachly/nestjs-libraries/database/prisma/notifications/notifications.repository';
import { EmailService } from '@reachly/nestjs-libraries/services/email.service';
import { StripeService } from '@reachly/nestjs-libraries/services/stripe.service';
import { PaymentService } from '@reachly/nestjs-libraries/services/payment/payment.service';
import { PaymentProviderManager } from '@reachly/nestjs-libraries/services/payment/payment.provider.manager';
import { RevenueCatProvider } from '@reachly/nestjs-libraries/services/payment/providers/revenuecat.provider';
import { ExtractContentService } from '@reachly/nestjs-libraries/openai/extract.content.service';
import { OpenaiService } from '@reachly/nestjs-libraries/openai/openai.service';
import { DeepgramService } from '@reachly/nestjs-libraries/deepgram/deepgram.service';
import { ClippingService } from '@reachly/nestjs-libraries/database/prisma/clipping/clipping.service';
import { ClippingRepository } from '@reachly/nestjs-libraries/database/prisma/clipping/clipping.repository';
import { AgenciesService } from '@reachly/nestjs-libraries/database/prisma/agencies/agencies.service';
import { AgenciesRepository } from '@reachly/nestjs-libraries/database/prisma/agencies/agencies.repository';
import { TrackService } from '@reachly/nestjs-libraries/track/track.service';
import { ShortLinkService } from '@reachly/nestjs-libraries/short-linking/short.link.service';
import { WebhooksRepository } from '@reachly/nestjs-libraries/database/prisma/webhooks/webhooks.repository';
import { WebhooksService } from '@reachly/nestjs-libraries/database/prisma/webhooks/webhooks.service';
import { SignatureRepository } from '@reachly/nestjs-libraries/database/prisma/signatures/signature.repository';
import { SignatureService } from '@reachly/nestjs-libraries/database/prisma/signatures/signature.service';
import { AutopostRepository } from '@reachly/nestjs-libraries/database/prisma/autopost/autopost.repository';
import { AutopostService } from '@reachly/nestjs-libraries/database/prisma/autopost/autopost.service';
import { SetsService } from '@reachly/nestjs-libraries/database/prisma/sets/sets.service';
import { SetsRepository } from '@reachly/nestjs-libraries/database/prisma/sets/sets.repository';
import { ThirdPartyRepository } from '@reachly/nestjs-libraries/database/prisma/third-party/third-party.repository';
import { ThirdPartyService } from '@reachly/nestjs-libraries/database/prisma/third-party/third-party.service';
import { VideoManager } from '@reachly/nestjs-libraries/videos/video.manager';
import { FalService } from '@reachly/nestjs-libraries/openai/fal.service';
import { RefreshIntegrationService } from '@reachly/nestjs-libraries/integrations/refresh.integration.service';
import { OAuthRepository } from '@reachly/nestjs-libraries/database/prisma/oauth/oauth.repository';
import { OAuthService } from '@reachly/nestjs-libraries/database/prisma/oauth/oauth.service';
import { AnnouncementsRepository } from '@reachly/nestjs-libraries/database/prisma/announcements/announcements.repository';
import { AnnouncementsService } from '@reachly/nestjs-libraries/database/prisma/announcements/announcements.service';
import { ErrorsRepository } from '@reachly/nestjs-libraries/database/prisma/errors/errors.repository';
import { ErrorsService } from '@reachly/nestjs-libraries/database/prisma/errors/errors.service';
import { AdminStatsRepository } from '@reachly/nestjs-libraries/database/prisma/admin-stats/admin-stats.repository';
import { AdminStatsService } from '@reachly/nestjs-libraries/database/prisma/admin-stats/admin-stats.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    PrismaRepository,
    PrismaTransaction,
    UsersService,
    UsersRepository,
    OrganizationService,
    OrganizationRepository,
    SubscriptionService,
    SubscriptionRepository,
    NotificationService,
    NotificationsRepository,
    WebhooksRepository,
    WebhooksService,
    IntegrationService,
    IntegrationRepository,
    PostsService,
    PostsRepository,
    StripeService,
    PaymentService,
    PaymentProviderManager,
    RevenueCatProvider,
    SignatureRepository,
    AutopostRepository,
    AutopostService,
    SignatureService,
    MediaService,
    MediaRepository,
    AgenciesService,
    AgenciesRepository,
    IntegrationManager,
    RefreshIntegrationService,
    ExtractContentService,
    OpenaiService,
    DeepgramService,
    ClippingService,
    ClippingRepository,
    FalService,
    EmailService,
    TrackService,
    ShortLinkService,
    SetsService,
    SetsRepository,
    ThirdPartyRepository,
    ThirdPartyService,
    OAuthRepository,
    OAuthService,
    VideoManager,
    AnnouncementsRepository,
    AnnouncementsService,
    ErrorsRepository,
    ErrorsService,
    AdminStatsRepository,
    AdminStatsService,
  ],
  get exports() {
    return this.providers;
  },
})
export class DatabaseModule {}
