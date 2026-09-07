import { User, AuditHistoryItem, AffiliateData, FAQ } from '../types';
import { SEED_USER, SEED_HISTORY, SEED_AFFILIATE, SEED_FAQS, DEMO_USER, DEMO_HISTORY } from '../seedData';
import { auditApi } from './api';

const KEYS = {
  USER: 'halal_auditor_user', // Currently logged in user
  USERS: 'halal_auditor_users_list', // List of all registered users
  HISTORY: 'halal_auditor_history',
  AFFILIATE: 'halal_auditor_affiliate',
  THEME: 'theme',
  FAQS: 'halal_auditor_faqs',
  LANGUAGE: 'language',
};

export const storage = {
  init: () => {
    if (!localStorage.getItem(KEYS.LANGUAGE)) {
      localStorage.setItem(KEYS.LANGUAGE, 'id');
    }
    
    // Initialize USERS list if empty
    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify([SEED_USER, DEMO_USER]));
    }

    // Initialize Global History if empty
    if (!localStorage.getItem(KEYS.HISTORY)) {
      localStorage.setItem(KEYS.HISTORY, JSON.stringify([...SEED_HISTORY, ...DEMO_HISTORY]));
    }

    if (!localStorage.getItem(KEYS.AFFILIATE)) {
      localStorage.setItem(KEYS.AFFILIATE, JSON.stringify(SEED_AFFILIATE));
    }
    if (!localStorage.getItem(KEYS.FAQS)) {
      localStorage.setItem(KEYS.FAQS, JSON.stringify(SEED_FAQS));
    }
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  register: (userData: Omit<User, 'id' | 'subscription' | 'createdAt' | 'role'> & { password: string }): User | string => {
    const users = storage.getUsers();
    if (users.find(u => u.email === userData.email)) {
      return 'Email already registered';
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
      subscription: {
        plan: 'free',
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        limits: {
          auditsPerMonth: 5,
          auditsUsed: 0,
        },
      },
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(KEYS.USERS, JSON.stringify([...users, newUser]));
    return newUser;
  },

  login: (email: string, password: string): User | string => {
    const users = storage.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return 'Invalid email or password';
    }
    storage.setUser(user);
    return user;
  },

  getUser: (): User | null => {
    const data = localStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  setUser: (user: User) => {
    localStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  getHistory: (): AuditHistoryItem[] => {
    const user = storage.getUser();
    if (!user) return [];
    
    const data = localStorage.getItem(KEYS.HISTORY);
    const allHistory: AuditHistoryItem[] = data ? JSON.parse(data) : [];
    
    // Multi-user: Filter history by current user ID
    return allHistory.filter(item => item.userId === user.id);
  },

  addHistory: (item: AuditHistoryItem) => {
    const data = localStorage.getItem(KEYS.HISTORY);
    const history = data ? JSON.parse(data) : [];
    localStorage.setItem(KEYS.HISTORY, JSON.stringify([item, ...history]));

    // Asynchronously sync to Backend Server
    auditApi.createAudit({
      type: item.type,
      input: item.input,
      output: item.output,
    }).catch(err => console.warn('[Backend Audit Sync Notice]', err));
  },

  deleteHistory: (id: string) => {
    const data = localStorage.getItem(KEYS.HISTORY);
    const history: AuditHistoryItem[] = data ? JSON.parse(data) : [];
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.filter(h => h.id !== id)));

    // Asynchronously delete on Backend Server
    auditApi.deleteAudit(id).catch(err => console.warn('[Backend Delete Sync Notice]', err));
  },

  getAffiliate: (): AffiliateData | null => {
    const data = localStorage.getItem(KEYS.AFFILIATE);
    return data ? JSON.parse(data) : null;
  },

  getFAQs: (): FAQ[] => {
    const data = localStorage.getItem(KEYS.FAQS);
    return data ? JSON.parse(data) : SEED_FAQS;
  },

  getLanguage: (): 'id' | 'en' => {
    return (localStorage.getItem(KEYS.LANGUAGE) as 'id' | 'en') || 'id';
  },

  setLanguage: (lang: 'id' | 'en') => {
    localStorage.setItem(KEYS.LANGUAGE, lang);
  },

  logout: () => {
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem('halator_auth_token');
  },

  clear: () => {
    localStorage.clear();
    storage.init();
  }
};
