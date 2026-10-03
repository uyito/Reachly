import { Global, Module } from '@nestjs/common';
import { LoadToolsService } from '@reachly/nestjs-libraries/chat/load.tools.service';
import { MastraService } from '@reachly/nestjs-libraries/chat/mastra.service';
import { toolList } from '@reachly/nestjs-libraries/chat/tools/tool.list';
import { McpRelayService } from '@reachly/nestjs-libraries/chat/mcp.relay.service';

@Global()
@Module({
  providers: [MastraService, LoadToolsService, McpRelayService, ...toolList],
  get exports() {
    return this.providers;
  },
})
export class ChatModule {}
