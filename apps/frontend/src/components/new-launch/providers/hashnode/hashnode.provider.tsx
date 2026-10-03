'use client';

import { FC } from 'react';
import {
  PostComment,
  withProvider,
} from '@reachly/frontend/components/new-launch/providers/high.order.provider';
import { useSettings } from '@reachly/frontend/components/launches/helpers/use.values';
import { Input } from '@reachly/react/form/input';
import { HashnodePublications } from '@reachly/frontend/components/new-launch/providers/hashnode/hashnode.publications';
import { HashnodeTags } from '@reachly/frontend/components/new-launch/providers/hashnode/hashnode.tags';
import { HashnodeSettingsDto } from '@reachly/nestjs-libraries/dtos/posts/providers-settings/hashnode.settings.dto';
import { useIntegration } from '@reachly/frontend/components/launches/helpers/use.integration';
import { useMediaDirectory } from '@reachly/react/helpers/use.media.directory';
import clsx from 'clsx';
import { MediaComponent } from '@reachly/frontend/components/media/media.component';
import { Canonical } from '@reachly/react/form/canonical';

const HashnodeSettings: FC = () => {
  const form = useSettings();
  const { date } = useIntegration();
  return (
    <>
      <Input label="Title" {...form.register('title')} />
      <Input label="Subtitle" {...form.register('subtitle')} />
      <Canonical
        date={date}
        label="Canonical Link"
        {...form.register('canonical')}
      />
      <MediaComponent
        label="Cover picture"
        description="Add a cover picture"
        {...form.register('main_image')}
      />
      <div className="mt-[20px]">
        <HashnodePublications {...form.register('publication')} />
      </div>
      <div>
        <HashnodeTags label="Tags" {...form.register('tags')} />
      </div>
    </>
  );
};
export default withProvider({
  postComment: PostComment.COMMENT,
  minimumCharacters: [],
  SettingsComponent: HashnodeSettings,
  CustomPreviewComponent: undefined, // HashnodePreview,
  dto: HashnodeSettingsDto,
  maximumCharacters: 10000,
});
