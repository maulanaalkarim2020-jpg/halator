export type Page = 'home' | 'product' | 'process' | 'transaction' | 'education' | 'settings' | 'dashboard' | 'login' | 'register' | 'subscription' | 'affiliate' | 'history';

export type Language = 'id' | 'en';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  gender?: 'male' | 'female';
  phone?: string;
  businessName?: string;
  businessAddress?: string;
  role: 'user' | 'admin';
  avatar?: string;
  subscription: Subscription;
  affiliateCode?: string;
  referredBy?: string;
  createdAt: string;
}

export interface Subscription {
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'expired' | 'trial';
  expiresAt: string;
  limits: {
    auditsPerMonth: number;
    auditsUsed: number;
  };
}

export interface AuditHistoryItem {
  id: string;
  userId: string;
  type: 'product' | 'process' | 'transaction';
  input: any;
  output: any;
  timestamp: string;
}

export interface AffiliateData {
  code: string;
  referrals: number;
  earnings: number;
  payoutHistory: { date: string; amount: number; status: string }[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface IngredientAnalysis {
  ingredient: string;
  status: 'Halal' | 'Haram' | 'Syubhat';
  reason: string;
}

export type ProductAuditResult = IngredientAnalysis[];

export interface ProcessAuditResult {
  summary: string;
  risks: string[];
  assessment: 'Compliant' | 'Needs Improvement' | 'Non-compliant';
}

export interface TransactionAuditResult {
  verdict: 'Permissible' | 'Impermissible' | 'Doubtful';
  explanation: string;
  analysis: {
    riba: boolean;
    gharar: boolean;
    maysir: boolean;
  };
}

export interface EducationResult {
  term: string;
  status: string;
  explanation: string;
  reference?: string;
  link?: string;
}

export type AuditResult = ProductAuditResult | ProcessAuditResult | TransactionAuditResult | EducationResult | { error: string } | string;
