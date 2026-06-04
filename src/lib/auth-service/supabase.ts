// Implementação Supabase Auth — preencher ao conectar ao backend
//
// Instalar dependências:
//   npm install @supabase/supabase-js @supabase/ssr
//
// Variáveis de ambiente necessárias (.env.local):
//   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
//
// import { createBrowserClient } from '@supabase/ssr'
// import type { AuthService, AuthResult } from '../auth-types'
//
// export function createSupabaseAuthService(): AuthService {
//   const supabase = createBrowserClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//   )
//   return {
//     async signIn({ email, password }) {
//       const { data, error } = await supabase.auth.signInWithPassword({ email, password })
//       if (error) return { session: null, error: error.message }
//       return { session: mapSupabaseSession(data.session), error: null }
//     },
//     async signUp({ email, password, name, surname }) {
//       const { data, error } = await supabase.auth.signUp({
//         email, password,
//         options: { data: { name, surname } }
//       })
//       if (error) return { session: null, error: error.message }
//       return { session: data.session ? mapSupabaseSession(data.session) : null, error: null }
//     },
//     async signOut() { await supabase.auth.signOut() },
//     async signInWithGoogle() {
//       const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
//       return { session: null, error: error?.message ?? null }
//     },
//     async signInWithGitHub() {
//       const { error } = await supabase.auth.signInWithOAuth({ provider: 'github' })
//       return { session: null, error: error?.message ?? null }
//     },
//     async sendPasswordReset(email) {
//       const { error } = await supabase.auth.resetPasswordForEmail(email)
//       return { error: error?.message ?? null }
//     },
//     async resetPassword(_, password) {
//       const { error } = await supabase.auth.updateUser({ password })
//       return { error: error?.message ?? null }
//     },
//     async getSession() {
//       const { data } = await supabase.auth.getSession()
//       return data.session ? mapSupabaseSession(data.session) : null
//     },
//   }
// }

export {};
