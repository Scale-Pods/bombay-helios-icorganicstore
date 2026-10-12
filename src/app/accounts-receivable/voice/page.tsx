'use client';

import { useAppContext } from '../../ClientWrapper';
import VoiceClient from './VoiceClient';
import { HELIOS_RECOVERY_OUTREACH, ICORGANIC_RECOVERY_OUTREACH } from '../_data/mockReceivables';

export default function ReceivablesVoicePage() {
  const { business } = useAppContext();
  const rows = business === 'icorganic' ? ICORGANIC_RECOVERY_OUTREACH : HELIOS_RECOVERY_OUTREACH;
  return <VoiceClient rows={rows} />;
}
