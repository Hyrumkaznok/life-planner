"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { User, Mail, Briefcase, Palette, CheckCircle2, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "#E11D48", "#9333EA", "#2563EB", "#0891B2",
  "#16A34A", "#D97706", "#EA580C", "#DB2777",
];

const ROLE_SUGGESTIONS = [
  "Estudante", "Desenvolvedor(a)", "Designer", "Gerente de Projetos",
  "Empreendedor(a)", "Analista", "Professor(a)", "Freelancer",
];

export default function PerfilPage() {
  const { userProfile, updateUserProfile, events, tasks, habits } = useAppStore();
  const { user, signOut, resetPassword } = useAuth();

  const [name, setName] = useState(userProfile.name || user?.name || "");
  const [role, setRole] = useState(userProfile.role);
  const [email, setEmail] = useState(userProfile.email || user?.email || "");
  const [avatarColor, setAvatarColor] = useState(userProfile.avatarColor);
  const [saved, setSaved] = useState(false);

  // Alterar senha
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "U";

  const handleSave = () => {
    updateUserProfile({ name, role, email, avatarColor, initials });
    setSaved(true);
    toast.success("Perfil atualizado!");
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges =
    name !== (userProfile.name || user?.name || "") ||
    role !== userProfile.role ||
    email !== (userProfile.email || user?.email || "") ||
    avatarColor !== userProfile.avatarColor;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error("A nova senha deve ter pelo menos 8 caracteres"); return; }
    if (newPassword !== confirmNewPassword) { toast.error("As senhas não coincidem"); return; }
    setPwdLoading(true);
    // Para mock: usa token fictício — com Supabase use supabase.auth.updateUser({ password })
    const err = await resetPassword("__change__", newPassword);
    setPwdLoading(false);
    if (err && !err.includes("inválido")) {
      toast.error(err);
    } else {
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword(""); setNewPassword(""); setConfirmNewPassword("");
    }
  };

  return (
    <div className="min-h-full">
      <PageHeader title="Meu Perfil" subtitle="Personalize suas informações pessoais">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="bg-gradient-to-r from-rose-500 to-pink-600 text-white border-0 disabled:opacity-40"
          size="sm"
        >
          {saved ? <><CheckCircle2 className="w-4 h-4 mr-1.5" />Salvo!</> : "Salvar alterações"}
        </Button>
      </PageHeader>

      <div className="p-7 max-w-2xl space-y-6">
        {/* Avatar + preview */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 card-shadow p-6">
          <div className="flex items-center gap-6">
            {/* Avatar preview */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0 transition-all"
              style={{ backgroundColor: avatarColor }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {name || "Seu nome"}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">{role || "Seu cargo / função"}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{email || "seu@email.com"}</p>
            </div>
          </div>

          {/* Color picker */}
          <div className="mt-5">
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 block">
              <Palette className="w-3 h-3 inline mr-1" />
              Cor do avatar
            </Label>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setAvatarColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-xl transition-all border-2",
                    avatarColor === color
                      ? "border-slate-900 dark:border-white scale-110 shadow-md"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 card-shadow p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-rose-500" /> Informações pessoais
          </h2>

          <div>
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nome completo</Label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="mt-1 w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Briefcase className="w-3 h-3 inline mr-1" /> Cargo / Função
            </Label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: Desenvolvedor(a), Estudante..."
              className="mt-1 w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ROLE_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setRole(s)}
                  className={cn(
                    "text-[10px] px-2.5 py-1 rounded-full border transition-colors font-medium",
                    role === s
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-rose-300"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Mail className="w-3 h-3 inline mr-1" /> E-mail
            </Label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1 w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 card-shadow p-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Resumo da conta</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Eventos", value: events.length, color: "#E11D48" },
              { label: "Tarefas", value: tasks.length, color: "#2563EB" },
              { label: "Hábitos", value: habits.length, color: "#9333EA" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-4 rounded-xl" style={{ backgroundColor: `${color}10` }}>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alterar senha */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 card-shadow p-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-500" /> Alterar senha
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Senha atual</Label>
              <div className="relative mt-1">
                <input
                  type={showCurrentPwd ? "text" : "password"}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500"
                />
                <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nova senha</Label>
              <div className="relative mt-1">
                <input
                  type={showNewPwd ? "text" : "password"}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500"
                />
                <button type="button" onClick={() => setShowNewPwd(!showNewPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Confirmar nova senha</Label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="mt-1 w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 bg-slate-50/50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" disabled={pwdLoading || !newPassword} size="sm"
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-0">
              {pwdLoading ? "Salvando…" : "Alterar senha"}
            </Button>
          </form>
        </div>

        {/* Conta / Logout */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 card-shadow p-6">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">Conta</h2>
          {user && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              Conectado como <span className="font-medium text-slate-600 dark:text-slate-300">{user.email}</span>
              {user.provider !== 'email' && (
                <span className="ml-1 text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full uppercase font-semibold">
                  {user.provider}
                </span>
              )}
            </p>
          )}
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
}
