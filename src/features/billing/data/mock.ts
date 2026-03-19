import { InvoiceStatus } from '../../../types/common.types';

export interface LineItem {
  label: string;
  amount: string;
}

export interface Invoice {
  id: string;
  invoiceId: string;
  date: string;
  dueDate: string;
  type: string;
  amount: string;
  status: InvoiceStatus;
  jobRef: string;
  jobName: string;
  client: string;
  paymentMethod?: string;
  paidDate?: string;
  lineItems: LineItem[];
  subtotal: string;
  tax: string;
}

export const INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceId: 'INV-101',
    date: 'Oct 20, 2024',
    dueDate: 'Nov 03, 2024',
    type: 'Standard',
    amount: '$450.00',
    status: 'paid',
    jobRef: '#4026',
    jobName: 'Retail Plaza',
    client: 'Alice Wong',
    paymentMethod: 'Bank Transfer',
    paidDate: 'Oct 28, 2024',
    lineItems: [
      { label: 'EV Charger Unit (Level 2 AC)', amount: '$280.00' },
      { label: 'Installation Labour (4 hrs)', amount: '$120.00' },
      { label: 'Site Survey', amount: '$50.00' },
    ],
    subtotal: '$405.41',
    tax: '$44.59',
  },
  {
    id: '2',
    invoiceId: 'INV-102',
    date: 'Oct 21, 2024',
    dueDate: 'Nov 04, 2024',
    type: 'Priority',
    amount: '$1,200.00',
    status: 'paid',
    jobRef: '#4024',
    jobName: 'Logistics Center',
    client: 'Diana Park',
    paymentMethod: 'Credit Card',
    paidDate: 'Oct 30, 2024',
    lineItems: [
      { label: 'DC Fast Charger x4 Units', amount: '$800.00' },
      { label: 'Installation Labour (8 hrs)', amount: '$240.00' },
      { label: 'Site Survey', amount: '$50.00' },
      { label: 'Priority Service Fee', amount: '$110.00' },
    ],
    subtotal: '$1,081.08',
    tax: '$118.92',
  },
  {
    id: '3',
    invoiceId: 'INV-103',
    date: 'Oct 22, 2024',
    dueDate: 'Nov 05, 2024',
    type: 'Standard',
    amount: '$350.00',
    status: 'pending',
    jobRef: '#4023',
    jobName: 'Greenway Condos',
    client: 'Marcus Lee',
    lineItems: [
      { label: 'EV Charger Unit (Level 2 AC)', amount: '$200.00' },
      { label: 'Installation Labour (3 hrs)', amount: '$100.00' },
      { label: 'Site Survey', amount: '$50.00' },
    ],
    subtotal: '$315.32',
    tax: '$34.68',
  },
  {
    id: '4',
    invoiceId: 'INV-104',
    date: 'Oct 23, 2024',
    dueDate: 'Nov 06, 2024',
    type: 'Commercial',
    amount: '$900.00',
    status: 'paid',
    jobRef: '#4022',
    jobName: 'Tesla Hub',
    client: 'Sarah Chen',
    paymentMethod: 'Bank Transfer',
    paidDate: 'Nov 01, 2024',
    lineItems: [
      { label: 'DC Fast Charger Unit', amount: '$550.00' },
      { label: 'Installation Labour (6 hrs)', amount: '$180.00' },
      { label: 'Site Survey', amount: '$50.00' },
      { label: 'Commercial Compliance Fee', amount: '$120.00' },
    ],
    subtotal: '$810.81',
    tax: '$89.19',
  },
];
