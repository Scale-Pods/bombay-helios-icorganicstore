'use client';

import { useAppContext } from '../../../ClientWrapper';
import EmailSection from '../EmailSection';
import { HELIOS_SALONS, ICORGANIC_SALONS } from '../../_data/mockSalons';

export default function SalonCrmEmailDashboardPage() {
  const { business } = useAppContext();
  const salons = business === 'icorganic' ? ICORGANIC_SALONS : HELIOS_SALONS;
  return <EmailSection salons={salons} view="dashboard" />;
}
