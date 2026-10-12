'use client';

import { useAppContext } from '../../../ClientWrapper';
import WhatsappSection from '../WhatsappSection';
import { HELIOS_SALONS, ICORGANIC_SALONS } from '../../_data/mockSalons';

export default function SalonCrmWhatsappAnalyticsPage() {
  const { business } = useAppContext();
  const salons = business === 'icorganic' ? ICORGANIC_SALONS : HELIOS_SALONS;
  return <WhatsappSection salons={salons} view="analytics" />;
}
