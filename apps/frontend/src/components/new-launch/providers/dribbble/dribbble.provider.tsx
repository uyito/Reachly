'use client';

import { FC } from 'react';
import {
  PostComment,
  withProvider,
} from '@reachly/frontend/components/new-launch/providers/high.order.provider';
import { useSettings } from '@reachly/frontend/components/launches/helpers/use.values';
import { Input } from '@reachly/react/form/input';
import { DribbbleTeams } from '@reachly/frontend/components/new-launch/providers/dribbble/dribbble.teams';
import { DribbbleDto } from '@reachly/nestjs-libraries/dtos/posts/providers-settings/dribbble.dto';
const DribbbleSettings: FC = () => {
  const { register, control } = useSettings();
  return (
    <div className="flex flex-col">
      <Input label={'Title'} {...register('title')} />
      <DribbbleTeams {...register('team')} />
    </div>
  );
};
export default withProvider({
  postComment: PostComment.COMMENT,
  minimumCharacters: [],
  SettingsComponent: DribbbleSettings,
  CustomPreviewComponent: undefined,
  dto: DribbbleDto,
  maximumCharacters: 40000,
});
