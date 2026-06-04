export interface AuthUser {
  id: string;
  email: string;
  name: string;
  surname?: string;
  avatarUrl?: string;
  provider: 'email' | 'google' | 'github';
  createdAt: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  expiresAt: number;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  surname?: string;
}

export interface AuthResult {
  session: AuthSession | null;
  error: string | null;
}

export interface AuthService {
  signIn(data: SignInData): Promise<AuthResult>;
  signUp(data: SignUpData): Promise<AuthResult>;
  signOut(): Promise<void>;
  signInWithGoogle(): Promise<AuthResult>;
  signInWithGitHub(): Promise<AuthResult>;
  sendPasswordReset(email: string): Promise<{ error: string | null }>;
  resetPassword(token: string, password: string): Promise<{ error: string | null }>;
  getSession(): Promise<AuthSession | null>;
}
