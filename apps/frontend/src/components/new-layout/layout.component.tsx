'use client';

import React, { ReactNode, useCallback, useEffect, useState } from 'react';
import { Logo } from '@reachly/frontend/components/new-layout/logo';
import { Plus_Jakarta_Sans } from 'next/font/google';
const ModeComponent = dynamic(
  () => import('@reachly/frontend/components/layout/mode.component'),
  {
    ssr: false,
  }
);

import clsx from 'clsx';
import dynamic from 'next/dynamic';
import { useFetch } from '@reachly/helpers/utils/custom.fetch';
import { useVariables } from '@reachly/react/helpers/variable.context';
import { usePathname, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { CheckPayment } from '@reachly/frontend/components/layout/check.payment';
import { ToolTip } from '@reachly/frontend/components/layout/top.tip';
import { ShowMediaBoxModal } from '@reachly/frontend/components/media/media.component';
import { ShowLinkedinCompany } from '@reachly/frontend/components/launches/helpers/linkedin.component';
import { MediaSettingsLayout } from '@reachly/frontend/components/launches/helpers/media.settings.component';
import { Toaster } from '@reachly/react/toaster/toaster';
import { ShowPostSelector } from '@reachly/frontend/components/post-url-selector/post.url.selector';
import { NewSubscription } from '@reachly/frontend/components/layout/new.subscription';
import { Support } from '@reachly/frontend/components/layout/support';
import { ContinueProvider } from '@reachly/frontend/components/layout/continue.provider';
import { ContextWrapper } from '@reachly/frontend/components/layout/user.context';
import { CopilotKit } from '@copilotkit/react-core';
import { MantineWrapper } from '@reachly/react/helpers/mantine.wrapper';
import { Impersonate } from '@reachly/frontend/components/layout/impersonate';
import { AnnouncementBanner } from '@reachly/frontend/components/layout/announcement.banner';
import { Title } from '@reachly/frontend/components/layout/title';
import { TopMenu } from '@reachly/frontend/components/layout/top.menu';
import { LanguageComponent } from '@reachly/frontend/components/layout/language.component';
import { ChromeExtensionComponent } from '@reachly/frontend/components/layout/chrome.extension.component';
import NotificationComponent from '@reachly/frontend/components/notifications/notification.component';
import { OrganizationSelector } from '@reachly/frontend/components/layout/organization.selector';
import { StreakComponent } from '@reachly/frontend/components/layout/streak.component';
import { PreConditionComponent } from '@reachly/frontend/components/layout/pre-condition.component';
import { AttachToFeedbackIcon } from '@reachly/frontend/components/new-layout/sentry.feedback.component';
import { FirstBillingComponent } from '@reachly/frontend/components/billing/first.billing.component';
import { TrialTracker } from '@reachly/frontend/components/layout/gtm.component';
import { setSentryUser } from '@reachly/react/sentry/initialize.sentry.client';

const jakartaSans = Plus_Jakarta_Sans({
  weight: ['600', '500', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
});

export const LayoutComponent = ({ children }: { children: ReactNode }) => {
  const fetch = useFetch();

  const { backendUrl, billingEnabled, isGeneral } = useVariables();

  // Feedback icon component attaches Sentry feedback to a top-bar icon when DSN is present
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);
  const load = useCallback(async (path: string) => {
    return await (await fetch(path)).json();
  }, []);
  const { data: user, mutate } = useSWR('/user/self', load, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
  });

  useEffect(() => {
    setSentryUser(
      user ? { id: user.id, email: user.email, orgId: user.orgId } : null
    );
  }, [user]);

  if (!user) return null;

  return (
    <ContextWrapper user={user}>
      <CopilotKit
        credentials="include"
        runtimeUrl={backendUrl + '/copilot/chat'}
        useSingleEndpoint={true}
        showDevConsole={false}
      >
        <MantineWrapper>
          <ToolTip />
          <Toaster />
          <TrialTracker />
          <CheckPayment check={searchParams.get('check') || ''} mutate={mutate}>
            <ShowMediaBoxModal />
            <ShowLinkedinCompany />
            <MediaSettingsLayout />
            <ShowPostSelector />
            <PreConditionComponent />
            <NewSubscription />
            <ContinueProvider />
            <div
              className={clsx(
                'flex flex-col min-h-screen min-w-screen text-newTextColor p-[12px] mobile:p-[8px] mobile:pb-[80px]',
                jakartaSans.className
              )}
            >
              <div>{user?.admin ? <Impersonate /> : <div />}</div>
              {user.tier === 'FREE' && isGeneral && billingEnabled ? (
                <FirstBillingComponent />
              ) : (
                <>
                  <AnnouncementBanner />
                  <div className="flex-1 flex gap-[8px] mobile:gap-0">
                    <Support />
                    {menuOpen && (
                      <div
                        className="hidden mobile:block fixed inset-0 bg-newBackdrop opacity-60 z-[490]"
                        onClick={() => setMenuOpen(false)}
                      />
                    )}
                    <div
                      className={clsx(
                        'flex flex-col bg-newBgColorInner w-[80px] rounded-[12px] mobile:fixed mobile:top-0 mobile:bottom-0 mobile:start-0 mobile:z-[491] mobile:rounded-none mobile:overflow-y-auto mobile:overflow-x-hidden',
                        !menuOpen && 'mobile:hidden'
                      )}
                      onClick={() => setMenuOpen(false)}
                    >
                      <div
                        id="left-menu"
                        className={clsx(
                          'fixed h-full w-[64px] start-[17px] flex flex-1 top-0 mobile:static mobile:h-auto mobile:min-h-full mobile:mx-auto',
                          user?.admin && 'pt-[60px] max-h-[1000px]:w-[500px]'
                        )}
                      >
                        <div className="flex flex-col h-full gap-[32px] mobile:gap-[16px] flex-1 py-[12px]">
                          <Logo />
                          <a href={process.env.NEXT_PUBLIC_SOURCE_URL || 'https://github.com/uyito/Reachly'} target="_blank" rel="noopener noreferrer" className="text-xs" aria-label="Reachly source code (AGPL-3.0)">Source code</a>
                          <TopMenu />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 bg-newBgLineColor rounded-[12px] overflow-hidden flex flex-col gap-[1px] blurMe">
                      <div className="flex bg-newBgColorInner h-[80px] mobile:h-[64px] px-[20px] mobile:px-[12px] gap-[12px] items-center">
                        <button
                          className="hidden mobile:flex items-center justify-center w-[36px] h-[36px] -ms-[6px] rounded-[8px] text-textItemBlur hover:text-newTextColor hover:bg-boxFocused"
                          onClick={() => setMenuOpen(true)}
                          aria-label="Open menu"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 6H21M3 12H21M3 18H21"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                        <div className="text-[24px] mobile:text-[20px] font-[600] flex flex-1 min-w-0">
                          <Title />
                        </div>
                        <div className="flex gap-[20px] mobile:gap-[14px] mobile:items-center text-textItemBlur">
                          <StreakComponent />
                          <div className="w-[1px] h-[20px] bg-blockSeparator mobile:hidden" />
                          <OrganizationSelector />
                          <div className="hover:text-newTextColor">
                            <ModeComponent />
                          </div>
                          <div className="w-[1px] h-[20px] bg-blockSeparator mobile:hidden" />
                          <LanguageComponent />
                          <div className="contents mobile:hidden">
                            <ChromeExtensionComponent />
                          </div>
                          <div className="w-[1px] h-[20px] bg-blockSeparator mobile:hidden" />
                          <div className="contents mobile:hidden">
                            <AttachToFeedbackIcon />
                          </div>
                          <NotificationComponent />
                        </div>
                      </div>
                      <div className="flex flex-1 min-w-0 gap-[1px] mobile:flex-col">
                        {children}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CheckPayment>
        </MantineWrapper>
      </CopilotKit>
    </ContextWrapper>
  );
};
