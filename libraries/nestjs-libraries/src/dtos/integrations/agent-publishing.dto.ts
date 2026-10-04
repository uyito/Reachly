import { IsBoolean, IsDefined } from 'class-validator';

export class AgentPublishingDto {
  @IsDefined()
  @IsBoolean()
  enabled: boolean;
}
