import cors from 'cors';
import express from 'express';

const app = express();
const port = process.env.PORT || 4010;

app.use(cors());
app.use(express.json());

const payload = {
  dashboard: {
    summary: [
      { label: 'Open Invoices', value: 'R45,230', detail: '12 overdue across 3 branches' },
      { label: 'Pending Approvals', value: '6', detail: 'Quotes and payment exceptions' },
      { label: 'Low Stock Alerts', value: '8', detail: 'Immediate reorder candidates' },
      { label: 'Collections Today', value: 'R18,400', detail: '74% toward daily target' }
    ]
  },
  customers: [
    { id: 'CUS-001', name: 'Acme Retail Group', branch: 'Johannesburg', balance: 'R27,400', status: 'Needs follow-up', risk: 'Medium', lastAction: 'Statement sent 2h ago' },
    { id: 'CUS-002', name: 'Northline Foods', branch: 'Cape Town', balance: 'R8,920', status: 'Healthy', risk: 'Low', lastAction: 'Invoice paid today' }
  ],
  quotes: [
    { id: 'Q-1045', customer: 'Urban Build Supply', value: 'R62,500', owner: 'Alex Morgan', status: 'Pending approval', updated: '22 min ago' },
    { id: 'Q-1042', customer: 'Acme Retail Group', value: 'R18,960', owner: 'Rina Patel', status: 'Sent to customer', updated: '1 hour ago' }
  ],
  invoices: [
    { id: 'INV-2201', customer: 'Acme Retail Group', amount: 'R12,440', due: 'Due today', status: 'Overdue', branch: 'Johannesburg' },
    { id: 'INV-2196', customer: 'Northline Foods', amount: 'R4,980', due: 'Due in 2 days', status: 'Issued', branch: 'Cape Town' }
  ],
  products: [
    { sku: 'SKU-1001', name: 'Kryvexis Label Printer', stock: 14, reorderAt: 10, price: 'R2,499', branch: 'Johannesburg' },
    { sku: 'SKU-1021', name: 'Thermal Roll Box', stock: 8, reorderAt: 12, price: 'R380', branch: 'Cape Town' }
  ],
  payments: [
    { ref: 'PAY-7701', party: 'Acme Retail Group', amount: 'R7,400', method: 'EFT', status: 'Allocated', date: 'Today 10:42' },
    { ref: 'PAY-7693', party: 'Northline Foods', amount: 'R4,980', method: 'Cash', status: 'Pending proof', date: 'Today 09:17' }
  ],
  notifications: [
    { title: 'Quote approval required', meta: 'Q-1045 • Sales', state: 'Pending' },
    { title: 'Invoice INV-2201 overdue', meta: 'Acme Retail Group • Finance', state: 'Urgent' },
    { title: 'Low stock threshold reached', meta: 'Thermal Roll Box • Procurement', state: 'Alert' }
  ],
  settings: {
    themes: ['dark', 'light', 'system'],
    paymentModes: ['EFT', 'Cash'],
    supportEmail: 'kryvexissolutions@gmail.com',
    whatsapp: '+27686282874'
  }
};

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', phase: 1, service: 'kryvexis-os-api' });
});

Object.keys(payload).forEach((key) => {
  app.get(`/${key}`, (_req, res) => {
    res.json(payload[key]);
  });
});

app.listen(port, () => {
  console.log(`Kryvexis OS Phase 1 backend running on ${port}`);
});
