import { Module } from '@nestjs/common';
import { PostActivity } from '@reachly/orchestrator/activities/post.activity';
import { getTemporalModule } from '@reachly/nestjs-libraries/temporal/temporal.module';
import { DatabaseModule } from '@reachly/nestjs-libraries/database/prisma/database.module';
import { AutopostService } from '@reachly/nestjs-libraries/database/prisma/autopost/autopost.service';
import { EmailActivity } from '@reachly/orchestrator/activities/email.activity';
import { IntegrationsActivity } from '@reachly/orchestrator/activities/integrations.activity';
import { VideoActivity } from '@reachly/orchestrator/activities/video.activity';
import { MediaActivity } from '@reachly/orchestrator/activities/media.activity';
import { ClippingActivity } from '@reachly/orchestrator/activities/clipping.activity';
import { VideoModule } from '@reachly/nestjs-libraries/videos/video.module';
import { HealthController } from '@reachly/orchestrator/health.controller';

const activities = [
  PostActivity,
  AutopostService,
  EmailActivity,
  IntegrationsActivity,
  VideoActivity,
  MediaActivity,
  ClippingActivity,
];
@Module({
  imports: [
    DatabaseModule,
    VideoModule,
    getTemporalModule(true, require.resolve('./workflows'), activities),
  ],
  controllers: [HealthController],
  providers: [...activities],
  get exports() {
    return [...this.providers, ...this.imports];
  },
})
export class AppModule {}
