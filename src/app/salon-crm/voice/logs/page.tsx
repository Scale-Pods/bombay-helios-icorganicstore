'use client';

import { useAppContext } from '../../../ClientWrapper';
import VoiceSection from '../VoiceSection';
import { HELIOS_SALONS, ICORGANIC_SALONS } from '../../_data/mockSalons';
import { HELIOS_VAPI_CALLS, ICORGANIC_VAPI_CALLS } from '../../_data/mockVapiCalls';

export default function SalonCrmVoiceLogsPage() {
  const { business } = useAppContext();
  const salons = business === 'icorganic' ? ICORGANIC_SALONS : HELIOS_SALONS;
  const logs = business === 'icorganic' ? ICORGANIC_VAPI_CALLS : HELIOS_VAPI_CALLS;
  return <VoiceSection logs={logs} salons={salons} view="logs" />;
}
