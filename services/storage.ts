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
    
    // Ensure clean USERS list (remove any legacy mock users)
    const rawUsers = localStorage.getItem(KEYS.USERS);
    if (rawUsers) {
      try {
        const users: User[] = JSON.parse(rawUsers);
        const realUsers = users.filter(
          (u) =>
            u.email !== 'ahmad@example.com' &&
            u.email !== 'halatordemo@demo.id' &&
            u.id !== 'user-123' &&
            u.id !== 'demo-user-1'
        );
        localStorage.setItem(KEYS.USERS, JSON.stringify(realUsers));
      } catch {
        localStorage.setItem(KEYS.USERS, JSON.stringify([]));
      }
    } else {
      localStorage.setItem(KEYS.USERS, JSON.stringify([]));
    }

    // Ensure clean HISTORY list (remove any mock history)
    const rawHistory = localStorage.getItem(KEYS.HISTORY);
    if (rawHistory) {
      try {
        const history: AuditHistoryItem[] = JSON.parse(rawHistory);
        const realHistory = history.filter(
          (h) =>
            h.id !== 'h1' &&
            h.id !== 'h2' &&
            h.id !== 'dh1' &&
            h.id !== 'dh2' &&
            h.id !== 'dh3' &&
            h.userId !== 'user-123' &&
            h.userId !== 'demo-user-1'
        );
        localStorage.setItem(KEYS.HISTORY, JSON.stringify(realHistory));
      } catch {
        localStorage.setItem(KEYS.HISTORY, JSON.stringify([]));
      }
    } else {
      localStorage.setItem(KEYS.HISTORY, JSON.stringify([]));
    }

    // Logout session if logged in as a mock user
    const currentUser = storage.getUser();
    if (
      currentUser &&
      (currentUser.email === 'ahmad@example.com' ||
        currentUser.email === 'halatordemo@demo.id' ||
        currentUser.id === 'user-123' ||
        currentUser.id === 'demo-user-1')
    ) {
      storage.logout();
    }

    // Remove legacy mock affiliate data
    const rawAffiliate = localStorage.getItem(KEYS.AFFILIATE);
    if (rawAffiliate) {
      try {
        const aff = JSON.parse(rawAffiliate);
        if (aff.code === 'AHMADHALAL' || aff.code === 'DEMOHALAL') {
          localStorage.removeItem(KEYS.AFFILIATE);
        }
      } catch {
        localStorage.removeItem(KEYS.AFFILIATE);
      }
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
    const cleanEmail = userData.email.toLowerCase().trim();

    // Prevent duplicate emails
    if (users.some((u) => u.email.toLowerCase().trim() === cleanEmail)) {
      return 'Email sudah terdaftar. Silakan gunakan email lain atau masuk.';
    }

    const cleanName = userData.name.trim();
    const initials = cleanName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'USER';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const newUser: User = {
      ...userData,
      name: cleanName,
      email: cleanEmail,
      id: `user-${Date.now()}`,
      role: 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`,
      affiliateCode: `${initials}${randomSuffix}`,
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
    const cleanEmail = email.toLowerCase().trim();
    const user = users.find((u) => u.email.toLowerCase().trim() === cleanEmail && u.password === password);
    if (!user) {
      return 'Email atau kata sandi salah.';
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

  addHistory: async (item: AuditHistoryItem) => {
    const data = localStorage.getItem(KEYS.HISTORY);
    const history = data ? JSON.parse(data) : [];
    localStorage.setItem(KEYS.HISTORY, JSON.stringify([item, ...history]));

    // Asynchronously sync to Backend Server (MongoDB)
    try {
      const res = await auditApi.createAudit({
        type: item.type,
        input: item.input,
        output: item.output,
      });

      if (res.success && res.data?.audit) {
        const serverAudit = res.data.audit as any;
        const serverId = serverAudit._id || serverAudit.id;
        if (serverId) {
          const raw = localStorage.getItem(KEYS.HISTORY);
          const currentList = raw ? JSON.parse(raw) : [];
          const idx = currentList.findIndex((h: AuditHistoryItem) => h.id === item.id);
          if (idx !== -1) {
            currentList[idx].id = serverId;
            localStorage.setItem(KEYS.HISTORY, JSON.stringify(currentList));
          }
        }
      }
    } catch (err) {
      console.warn('[Backend Audit Sync Notice]', err);
    }
  },

  syncHistoryWithBackend: async (): Promise<AuditHistoryItem[]> => {
    try {
      const user = storage.getUser();
      if (!user) return storage.getHistory();

      const res = await auditApi.getHistory();
      if (res.success && res.data?.items) {
        const remoteItems: AuditHistoryItem[] = res.data.items.map((it: any) => ({
          id: it._id ? it._id.toString() : it.id,
          userId: it.userId ? it.userId.toString() : user.id,
          type: it.type,
          input: it.input,
          output: it.output,
          timestamp: it.timestamp || it.createdAt || new Date().toISOString(),
        }));

        const local = storage.getHistory();
        const merged = [...remoteItems];
        for (const loc of local) {
          if (!merged.some((m) => m.id === loc.id || (m.input === loc.input && m.type === loc.type))) {
            merged.push(loc);
          }
        }
        localStorage.setItem(KEYS.HISTORY, JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.warn('[Sync History Notice]', e);
    }
    return storage.getHistory();
  },

  deleteHistory: (id: string) => {
    const data = localStorage.getItem(KEYS.HISTORY);
    const history: AuditHistoryItem[] = data ? JSON.parse(data) : [];
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history.filter(h => h.id !== id)));

    // Asynchronously delete on Backend Server
    auditApi.deleteAudit(id).catch(err => console.warn('[Backend Delete Sync Notice]', err));
  },

  getAffiliate: (): AffiliateData | null => {
    const user = storage.getUser();
    if (!user) return null;
    const data = localStorage.getItem(KEYS.AFFILIATE);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.code !== 'AHMADHALAL' && parsed.code !== 'DEMOHALAL') {
          return parsed;
        }
      } catch {
        // Continue to recreate
      }
    }
    const cleanAff: AffiliateData = {
      code: user.affiliateCode || 'HALA' + Math.floor(1000 + Math.random() * 9000),
      referrals: 0,
      earnings: 0,
      payoutHistory: [],
    };
    localStorage.setItem(KEYS.AFFILIATE, JSON.stringify(cleanAff));
    return cleanAff;
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
