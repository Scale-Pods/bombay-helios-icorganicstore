'use client';

import { useAppContext } from '../../../ClientWrapper';
import EmailSection from '../EmailSection';
import { HELIOS_RECOVERY_OUTREACH, ICORGANIC_RECOVERY_OUTREACH } from '../../_data/mockReceivables';

export default function ReceivablesEmailAnalyticsPage() {
  const { business } = useAppContext();
  const rows = business === 'icorganic' ? ICORGANIC_RECOVERY_OUTREACH : HELIOS_RECOVERY_OUTREACH;
  return <EmailSection rows={rows} view="analytics" />;
}
