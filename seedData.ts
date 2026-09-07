import { User, AuditHistoryItem, AffiliateData } from './types';

export const SEED_USER: User = {
  id: 'user-123',
  name: 'Ahmad Fauzi',
  email: 'ahmad@example.com',
  role: 'user',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
  subscription: {
    plan: 'pro',
    status: 'active',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    limits: {
      auditsPerMonth: 100,
      auditsUsed: 12,
    },
  },
  affiliateCode: 'AHMADHALAL',
  createdAt: '2024-01-15T10:00:00Z',
};

export const SEED_HISTORY: AuditHistoryItem[] = [
  {
    id: 'h1',
    userId: 'user-123',
    type: 'product',
    input: 'Gelatin, Lecithin, E120',
    output: [
      { ingredient: 'Gelatin', status: 'Syubhat', reason: 'Source of gelatin (bovine/porcine) must be verified.' },
      { ingredient: 'Lecithin', status: 'Halal', reason: 'Plant-based lecithin is common, but source should be checked.' },
      { ingredient: 'E120', status: 'Haram', reason: 'Carmine is derived from insects, considered haram by many authorities.' },
    ],
    timestamp: '2024-03-10T14:30:00Z',
  },
  {
    id: 'h2',
    userId: 'user-123',
    type: 'transaction',
    input: 'Investment in a company that has 15% interest-bearing debt.',
    output: {
      verdict: 'Doubtful',
      explanation: 'The debt-to-equity ratio is within some Shariah screening limits (usually <33%), but interest is inherently problematic.',
      analysis: { riba: true, gharar: false, maysir: false },
    },
    timestamp: '2024-03-12T09:15:00Z',
  },
];

export const SEED_AFFILIATE: AffiliateData = {
  code: 'AHMADHALAL',
  referrals: 24,
  earnings: 450000,
  payoutHistory: [
    { date: '2024-02-01', amount: 200000, status: 'Paid' },
    { date: '2024-03-01', amount: 250000, status: 'Paid' },
  ],
};

export const SEED_NOTIFICATIONS = [
  { id: 'n1', title: 'Audit Complete', message: 'Your analysis for "Product X" is ready.', date: '2024-03-12T10:00:00Z', read: false },
  { id: 'n2', title: 'Subscription Renewed', message: 'Your Pro plan has been successfully renewed.', date: '2024-03-01T08:00:00Z', read: true },
];

export const DEMO_USER: User = {
  id: 'demo-user-1',
  name: 'Halator Demo',
  email: 'halatordemo@demo.id',
  password: 'password123',
  role: 'user',
  phone: '08123456789',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
  subscription: {
    plan: 'pro',
    status: 'active',
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    limits: {
      auditsPerMonth: 100,
      auditsUsed: 42,
    },
  },
  affiliateCode: 'DEMOHALAL',
  createdAt: '2024-01-01T00:00:00Z',
};

export const DEMO_HISTORY: AuditHistoryItem[] = [
  {
    id: 'dh1',
    userId: 'demo-user-1',
    type: 'product',
    input: 'Sodium Stearate, Glycerin, Fragrance',
    output: [
      { ingredient: 'Sodium Stearate', status: 'Syubhat', reason: 'Can be derived from animal fat or vegetable oil.' },
      { ingredient: 'Glycerin', status: 'Syubhat', reason: 'Source must be verified (bovine/porcine/plant).' },
      { ingredient: 'Fragrance', status: 'Halal', reason: 'Generally safe, but alcohol content should be monitored.' },
    ],
    timestamp: '2024-04-10T10:00:00Z',
  },
  {
    id: 'dh2',
    userId: 'demo-user-1',
    type: 'process',
    input: 'Logistik dan Penyimpanan Gudang',
    output: {
      summary: 'Alur logistik sudah terpisah antara barang halal dan non-halal.',
      risks: ['Kontaminasi silang saat pemuatan barang'],
      assessment: 'Compliant'
    },
    timestamp: '2024-04-12T15:30:00Z',
  },
  {
    id: 'dh3',
    userId: 'demo-user-1',
    type: 'transaction',
    input: 'Pinjaman bank dengan bunga 5% per tahun.',
    output: {
      verdict: 'Impermissible',
      explanation: 'Pinjaman ini mengandung Riba (bunga) yang dilarang keras dalam Islam.',
      analysis: { riba: true, gharar: false, maysir: false },
    },
    timestamp: '2024-04-15T09:00:00Z',
  },
];

export const SEED_FAQS = [
  { question: 'Bagaimana AI menentukan status Halal?', answer: 'AI kami dilatih menggunakan database bahan pangan global dan fatwa dari lembaga otoritas seperti MUI, JAKIM, dan ESMA.' },
  { question: 'Apakah audit transaksi mencakup kripto?', answer: 'Ya, sistem kami dapat menganalisis kontrak pintar dan mekanisme tokenomics untuk mendeteksi unsur Gharar atau Maysir.' },
  { question: 'Apakah hasil audit ini legal?', answer: 'Hasil audit AI bersifat edukatif dan referensi awal. Untuk sertifikasi resmi, Anda tetap harus melalui lembaga sertifikasi Halal yang berwenang.' },
];
