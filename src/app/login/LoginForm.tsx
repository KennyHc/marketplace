"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const DOMAIN_ERROR = "Solo se admiten emails de tu organización (@demo.test)";

export function LoginForm() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function done() {
    router.replace("/");
    router.refresh();
  }

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const clean = email.trim().toLowerCase();
    const { data: allowed, error: rpcError } = await supabase.rpc("is_domain_allowed", { email: clean });
    if (rpcError) {
      setLoading(false);
      setError("No se pudo comprobar tu email. Inténtalo de nuevo.");
      return;
    }
    if (!allowed) {
      setLoading(false);
      setError(DOMAIN_ERROR);
      return;
    }
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (otpError) {
      setError(/domain|dominio|organiz|database error/i.test(otpError.message) ? DOMAIN_ERROR : "No se pudo enviar el código. Inténtalo de nuevo en unos minutos.");
      return;
    }
    setEmail(clean);
    setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    if (err) {
      setLoading(false);
      setError("Código incorrecto o caducado.");
      return;
    }
    done();
  }

  async function passwordLogin(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: demoEmail.trim().toLowerCase(), password });
    if (err) {
      setPwLoading(false);
      setPwError("Email o contraseña incorrectos.");
      return;
    }
    done();
  }

  return (
    <div className="space-y-4">
      {step === "email" ? (
        <form onSubmit={sendCode} className="card space-y-4 p-4">
          <div>
            <label htmlFor="email" className="label">Email de tu organización</label>
            <input id="email" type="email" required autoComplete="email" className="input" placeholder="tu.nombre@demo.test" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <div className="error" role="alert">{error}</div>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? "Enviando…" : "Enviar código"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} className="card space-y-4 p-4">
          <p className="text-sm">Te hemos enviado un código de 6 dígitos a <b>{email}</b>.</p>
          <div>
            <label htmlFor="code" className="label">Código</label>
            <input id="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required className="input text-center text-2xl tracking-[0.5em]" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
          </div>
          <p className="text-sm text-muted">También puedes hacer clic en el enlace del email.</p>
          {error && <div className="error" role="alert">{error}</div>}
          <button type="submit" className="btn-primary w-full" disabled={loading || code.length !== 6}>
            {loading ? "Verificando…" : "Entrar"}
          </button>
          <button type="button" className="btn-secondary w-full" onClick={() => { setStep("email"); setCode(""); setError(null); }}>
            Usar otro email
          </button>
        </form>
      )}

      <details className="card p-4">
        <summary className="cursor-pointer text-sm font-medium text-muted">Acceso demo (contraseña)</summary>
        <form onSubmit={passwordLogin} className="mt-4 space-y-4">
          <div>
            <label htmlFor="demo-email" className="label">Email</label>
            <input id="demo-email" type="email" required className="input" value={demoEmail} onChange={(e) => setDemoEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="demo-pass" className="label">Contraseña</label>
            <input id="demo-pass" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {pwError && <div className="error" role="alert">{pwError}</div>}
          <button type="submit" className="btn-secondary w-full" disabled={pwLoading}>{pwLoading ? "Entrando…" : "Entrar"}</button>
        </form>
      </details>
    </div>
  );
}
