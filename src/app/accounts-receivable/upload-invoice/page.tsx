'use client';

import { useAppContext } from '../../ClientWrapper';
import UploadInvoiceClient from './UploadInvoiceClient';
import { HELIOS_PARTY_LEDGER, ICORGANIC_PARTY_LEDGER } from '../_data/mockReceivables';

export default function UploadInvoicePage() {
  const { business } = useAppContext();
  const rows = business === 'icorganic' ? ICORGANIC_PARTY_LEDGER : HELIOS_PARTY_LEDGER;
  return <UploadInvoiceClient rows={rows} />;
}
