'use client';

import { useAppContext } from '../../ClientWrapper';
import ReceivablesDashboard from './ReceivablesDashboard';
import {
  HELIOS_PARTY_LEDGER,
  HELIOS_RECOVERY_OUTREACH,
  ICORGANIC_PARTY_LEDGER,
  ICORGANIC_RECOVERY_OUTREACH,
} from '../_data/mockReceivables';

export default function AccountsReceivableDashboardPage() {
  const { business } = useAppContext();

  const ledger = business === 'icorganic' ? ICORGANIC_PARTY_LEDGER : HELIOS_PARTY_LEDGER;
  const outreach = business === 'icorganic' ? ICORGANIC_RECOVERY_OUTREACH : HELIOS_RECOVERY_OUTREACH;

  return <ReceivablesDashboard ledger={ledger} outreach={outreach} />;
}
