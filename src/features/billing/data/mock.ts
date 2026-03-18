import { InvoiceStatus } from '../../../types/common.types';

export interface Invoice {
  id: string;
  invoiceId: string;
  date: string;
  type: string;
  amount: string;
  status: InvoiceStatus;
}

export const INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceId: 'INV-101',
    date: 'Oct 20, 2023',
    type: 'Standard',
    amount: '$450.00',
    status: 'paid',
  },
  {
    id: '2',
    invoiceId: 'INV-102',
    date: 'Oct 21, 2023',
    type: 'Priority',
    amount: '$1,200.00',
    status: 'paid',
  },
  {
    id: '3',
    invoiceId: 'INV-103',
    date: 'Oct 22, 2023',
    type: 'Standard',
    amount: '$350.00',
    status: 'pending',
  },
  {
    id: '4',
    invoiceId: 'INV-104',
    date: 'Oct 23, 2023',
    type: 'Commercial',
    amount: '$900.00',
    status: 'paid',
  },
];
