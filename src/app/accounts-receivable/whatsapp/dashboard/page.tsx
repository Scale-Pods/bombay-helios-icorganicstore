'use client';

import { useAppContext } from '../../../ClientWrapper';
import WhatsappSection from '../WhatsappSection';
import { HELIOS_RECOVERY_OUTREACH, ICORGANIC_RECOVERY_OUTREACH } from '../../_data/mockReceivables';

export default function ReceivablesWhatsappDashboardPage() {
  const { business } = useAppContext();
  const rows = business === 'icorganic' ? ICORGANIC_RECOVERY_OUTREACH : HELIOS_RECOVERY_OUTREACH;
  return <WhatsappSection rows={rows} view="dashboard" />;
}
