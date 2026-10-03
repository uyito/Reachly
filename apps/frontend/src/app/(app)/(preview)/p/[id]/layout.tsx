import { ReactNode } from 'react';
import { PreviewWrapper } from '@reachly/frontend/components/preview/preview.wrapper';

export default async function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-newBgColor min-h-screen text-newTextColor">
      <PreviewWrapper>{children}</PreviewWrapper>
    </div>
  );
}
