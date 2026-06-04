import { mockAuthService } from './mock';

// Para conectar ao Supabase, substitua por:
//   import { createSupabaseAuthService } from './supabase';
//   export const authService = createSupabaseAuthService();

export const authService = mockAuthService;
