export const dynamic = 'force-dynamic';
import { BillingComponent } from '@reachly/frontend/components/billing/billing.component';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@reachly/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Reachly' : 'Reachly'} Billing`,
  description: '',
};
export default async function Page() {
  return (
    <div className="bg-newBgColorInner flex-1 flex-col flex p-[20px] gap-[12px]">
      <BillingComponent />
    </div>
  );
}
