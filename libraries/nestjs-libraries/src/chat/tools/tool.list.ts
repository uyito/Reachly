import { IntegrationValidationTool } from '@reachly/nestjs-libraries/chat/tools/integration.validation.tool';
import { IntegrationTriggerTool } from '@reachly/nestjs-libraries/chat/tools/integration.trigger.tool';
import { IntegrationSchedulePostTool } from './integration.schedule.post';
import { GenerateVideoOptionsTool } from '@reachly/nestjs-libraries/chat/tools/generate.video.options.tool';
import { VideoFunctionTool } from '@reachly/nestjs-libraries/chat/tools/video.function.tool';
import { GenerateVideoTool } from '@reachly/nestjs-libraries/chat/tools/generate.video.tool';
import { VideoStatusTool } from '@reachly/nestjs-libraries/chat/tools/video.status.tool';
import { ClippingTool } from '@reachly/nestjs-libraries/chat/tools/clipping.tool';
import { ClippingStatusTool } from '@reachly/nestjs-libraries/chat/tools/clipping.status.tool';
import { ClippingWidgetTicketTool } from '@reachly/nestjs-libraries/chat/tools/clipping.widget.ticket.tool';
import { GenerateImageTool } from '@reachly/nestjs-libraries/chat/tools/generate.image.tool';
import { IntegrationListTool } from '@reachly/nestjs-libraries/chat/tools/integration.list.tool';
import { GroupListTool } from '@reachly/nestjs-libraries/chat/tools/group.list.tool';
import { UploadFromUrlTool } from '@reachly/nestjs-libraries/chat/tools/upload.from.url.tool';
import { PostsListTool } from '@reachly/nestjs-libraries/chat/tools/posts.list.tool';
import { PostSettingsTool } from '@reachly/nestjs-libraries/chat/tools/post.settings.tool';
import { UploadWidgetTool } from '@reachly/nestjs-libraries/chat/tools/upload.widget.tool';
import { UploadWidgetTicketTool } from '@reachly/nestjs-libraries/chat/tools/upload.widget.ticket.tool';
import { UploadWidgetStatusTool } from '@reachly/nestjs-libraries/chat/tools/upload.widget.status.tool';

export const toolList = [
  IntegrationListTool,
  GroupListTool,
  IntegrationValidationTool,
  IntegrationTriggerTool,
  IntegrationSchedulePostTool,
  PostsListTool,
  PostSettingsTool,
  GenerateVideoOptionsTool,
  VideoFunctionTool,
  GenerateVideoTool,
  VideoStatusTool,
  ClippingTool,
  ClippingStatusTool,
  ClippingWidgetTicketTool,
  GenerateImageTool,
  UploadFromUrlTool,
  UploadWidgetTool,
  UploadWidgetTicketTool,
  UploadWidgetStatusTool,
];
