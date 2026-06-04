import type { AuthService, AuthUser, AuthSession, SignInData, SignUpData, AuthResult } from '../auth-types';

const USERS_KEY = 'lp_auth_users';
const SESSION_KEY = 'lp_auth_session';
const RESET_TOKENS_KEY = 'lp_auth_reset_tokens';

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function generateToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

// Simple deterministic hash for mock purposes — NOT cryptographically secure
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

interface StoredUser {
  id: string;
  email: string;
  name: string;
  surname?: string;
  passwordHash: string;
  avatarUrl?: string;
  provider: 'email' | 'google' | 'github';
  createdAt: string;
}

function getUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function buildSession(user: StoredUser): AuthSession {
  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
      createdAt: user.createdAt,
    },
    accessToken: generateToken(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };
}

function persistSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  const expires = new Date(session.expiresAt).toUTCString();
  document.cookie = `lp_session=${session.accessToken}; expires=${expires}; path=/; SameSite=Lax`;
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  document.cookie = 'lp_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
}

export const mockAuthService: AuthService = {
  async signIn({ email, password }: SignInData): Promise<AuthResult> {
    await new Promise(r => setTimeout(r, 600));
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { session: null, error: 'E-mail ou senha incorretos' };
    }
    const session = buildSession(user);
    persistSession(session);
    return { session, error: null };
  },

  async signUp({ email, password, name, surname }: SignUpData): Promise<AuthResult> {
    await new Promise(r => setTimeout(r, 600));
    const users = getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { session: null, error: 'Este e-mail já está em uso' };
    }
    const newUser: StoredUser = {
      id: generateId(),
      email: email.toLowerCase(),
      name,
      surname,
      passwordHash: hashPassword(password),
      provider: 'email',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const session = buildSession(newUser);
    persistSession(session);
    return { session, error: null };
  },

  async signOut(): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
    clearSession();
  },

  async signInWithGoogle(): Promise<AuthResult> {
    await new Promise(r => setTimeout(r, 900));
    const email = 'usuario.demo@gmail.com';
    const users = getUsers();
    let user = users.find(u => u.email === email && u.provider === 'google');
    if (!user) {
      user = {
        id: generateId(),
        email,
        name: 'Usuário',
        surname: 'Demo',
        passwordHash: '',
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      saveUsers(users);
    }
    const session = buildSession(user);
    persistSession(session);
    return { session, error: null };
  },

  async signInWithGitHub(): Promise<AuthResult> {
    return { session: null, error: 'Login com GitHub em breve' };
  },

  async sendPasswordReset(email: string): Promise<{ error: string | null }> {
    await new Promise(r => setTimeout(r, 700));
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { error: null }; // never reveal if email exists
    const token = generateToken();
    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}');
    tokens[token] = { email: user.email, expiresAt: Date.now() + 60 * 60 * 1000 };
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
    // Em produção, dispararia e-mail real. Mock: loga o link no console.
    console.info(`[Mock Auth] Link de redefinição: /redefinir-senha?token=${token}`);
    return { error: null };
  },

  async resetPassword(token: string, password: string): Promise<{ error: string | null }> {
    await new Promise(r => setTimeout(r, 600));
    const tokens = JSON.parse(localStorage.getItem(RESET_TOKENS_KEY) || '{}');
    const resetData = tokens[token];
    if (!resetData || resetData.expiresAt < Date.now()) {
      return { error: 'Link inválido ou expirado' };
    }
    const users = getUsers();
    const idx = users.findIndex(u => u.email === resetData.email);
    if (idx === -1) return { error: 'Usuário não encontrado' };
    users[idx].passwordHash = hashPassword(password);
    saveUsers(users);
    delete tokens[token];
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(tokens));
    return { error: null };
  },

  async getSession(): Promise<AuthSession | null> {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: AuthSession = JSON.parse(raw);
      if (session.expiresAt < Date.now()) { clearSession(); return null; }
      return session;
    } catch { return null; }
  },
};
