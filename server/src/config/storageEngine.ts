import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const AUDITS_FILE = path.join(DATA_DIR, 'audits.json');
const AFFILIATES_FILE = path.join(DATA_DIR, 'affiliates.json');

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJSON<T>(filePath: string, defaultVal: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
      return defaultVal;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return defaultVal;
  }
}

function writeJSON<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Failed to write to ${filePath}`, err);
  }
}

export const isDbConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const localStore = {
  getUsers: (): any[] => readJSON<any[]>(USERS_FILE, []),
  saveUsers: (users: any[]) => writeJSON(USERS_FILE, users),

  findUserByEmail: (email: string): any | null => {
    const users = localStore.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  },

  findUserById: (id: string): any | null => {
    const users = localStore.getUsers();
    return users.find((u) => u.id === id || u._id === id) || null;
  },

  createUser: async (userData: any): Promise<any> => {
    const users = localStore.getUsers();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStore.saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  getAudits: (): any[] => readJSON<any[]>(AUDITS_FILE, []),
  saveAudits: (audits: any[]) => writeJSON(AUDITS_FILE, audits),

  createAudit: (auditData: any): any => {
    const audits = localStore.getAudits();
    const newAudit = {
      ...auditData,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    audits.unshift(newAudit);
    localStore.saveAudits(audits);
    return newAudit;
  },

  getAffiliates: (): any[] => readJSON<any[]>(AFFILIATES_FILE, []),
  saveAffiliates: (affiliates: any[]) => writeJSON(AFFILIATES_FILE, affiliates),
};
