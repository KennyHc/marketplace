"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, ChevronDown, KeyRound, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAnimationControls } from "motion/react";
import { motion, AnimatePresence, EASE } from "@/components/ui/motion";

const DOMAIN_ERROR = "Solo se admiten emails de tu organización (@demo.test)";

const shake = { x: [0, -8, 8, -6, 6, -3, 0], transition: { duration: 0.45 } };

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="error" role="alert">
        <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
        <span>{children}</span>
      </div>
    </motion.div>
  );
}

function CodeInput({ value, onChange, onComplete, disabled }: { value: string; onChange: (v: string) => void; onComplete: (v: string) => void; disabled: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function update(next: string) {
    onChange(next);
    if (next.length === 6) onComplete(next);
  }

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="Código de 6 dígitos">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          id={i === 0 ? "code" : undefined}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={6}
          disabled={disabled}
          aria-label={`Dígito ${i + 1}`}
          value={d}
          autoFocus={i === 0}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const clean = e.target.value.replace(/\D/g, "");
            if (!clean) {
              update(value.slice(0, i) + value.slice(i + 1));
              return;
            }
            const next = (value.slice(0, i) + clean).slice(0, 6);
            update(next);
            refs.current[Math.min(next.length, 5)]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              update(value.slice(0, i - 1));
              refs.current[i - 1]?.focus();
            } else if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            else if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
          }}
          onPaste={(e) => {
            const clean = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (!clean) return;
            e.preventDefault();
            update(clean);
            refs.current[Math.min(clean.length, 5)]?.focus();
          }}
          className="h-14 w-full min-w-0 rounded-xl border border-line bg-surface text-center text-xl font-semibold tabular-nums shadow-xs outline-none transition-[border-color,box-shadow] duration-200 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-60"
        />
      ))}
    </div>
  );
}

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
  const [demoOpen, setDemoOpen] = useState(false);
  const controls = useAnimationControls();

  function fail(msg: string) {
    setError(msg);
    controls.start(shake);
  }

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
      fail("No se pudo comprobar tu email. Inténtalo de nuevo.");
      return;
    }
    if (!allowed) {
      setLoading(false);
      fail(DOMAIN_ERROR);
      return;
    }
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (otpError) {
      fail(/domain|dominio|organiz|database error/i.test(otpError.message) ? DOMAIN_ERROR : "No se pudo enviar el código. Inténtalo de nuevo en unos minutos.");
      return;
    }
    setEmail(clean);
    setStep("code");
  }

  async function verifyCode(token: string) {
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({ email, token: token.trim(), type: "email" });
    if (err) {
      setLoading(false);
      setCode("");
      fail("Código incorrecto o caducado.");
      return;
    }
    done();
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length === 6) verifyCode(code);
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
    <div className="space-y-5">
      <motion.div animate={controls}>
        <AnimatePresence mode="wait" initial={false}>
          {step === "email" ? (
            <motion.form
              key="email"
              onSubmit={sendCode}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Bienvenido a Pasillo</h2>
                <p className="mt-1.5 text-sm text-muted">Entra con tu email de trabajo. Te enviaremos un código de acceso.</p>
              </div>
              <div>
                <label htmlFor="email" className="label">Email de tu organización</label>
                <div className="relative">
                  <Mail size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
                  <input id="email" type="email" required autoComplete="email" className="input pl-10" placeholder="tu.nombre@demo.test" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <AnimatePresence initial={false}>{error && <ErrorMsg>{error}</ErrorMsg>}</AnimatePresence>
              <button type="submit" className="btn-primary btn-lg w-full" disabled={loading}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> Enviando…</> : <>Enviar código <ArrowRight size={18} strokeWidth={1.75} /></>}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="code"
              onSubmit={verify}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="space-y-5"
            >
              <div>
                <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <Mail size={20} strokeWidth={1.75} />
                </span>
                <h2 className="text-2xl font-semibold tracking-tight">Revisa tu correo</h2>
                <p className="mt-1.5 text-sm text-muted">
                  Te hemos enviado un código de 6 dígitos a <b className="font-medium text-foreground">{email}</b>.
                </p>
              </div>
              <CodeInput value={code} onChange={setCode} onComplete={verifyCode} disabled={loading} />
              <p className="text-sm text-muted">También puedes hacer clic en el enlace del email.</p>
              <AnimatePresence initial={false}>{error && <ErrorMsg>{error}</ErrorMsg>}</AnimatePresence>
              <button type="submit" className="btn-primary btn-lg w-full" disabled={loading || code.length !== 6}>
                {loading ? <><Loader2 size={18} className="animate-spin" /> Verificando…</> : "Entrar"}
              </button>
              <button type="button" className="btn-ghost w-full" onClick={() => { setStep("email"); setCode(""); setError(null); }}>
                <ArrowLeft size={16} strokeWidth={1.75} /> Usar otro email
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="border-t border-line pt-4">
        <button
          type="button"
          onClick={() => setDemoOpen((o) => !o)}
          aria-expanded={demoOpen}
          className="flex w-full items-center justify-between rounded-lg py-1 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <span className="inline-flex items-center gap-2"><KeyRound size={16} strokeWidth={1.75} /> Acceso demo (contraseña)</span>
          <motion.span animate={{ rotate: demoOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown size={16} strokeWidth={1.75} />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {demoOpen && (
            <motion.form
              onSubmit={passwordLogin}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-4">
                <div>
                  <label htmlFor="demo-email" className="label">Email</label>
                  <input id="demo-email" type="email" required className="input" value={demoEmail} onChange={(e) => setDemoEmail(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="demo-pass" className="label">Contraseña</label>
                  <input id="demo-pass" type="password" required autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {pwError && <div className="error" role="alert"><AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />{pwError}</div>}
                <button type="submit" className="btn-secondary w-full" disabled={pwLoading}>
                  {pwLoading ? <><Loader2 size={16} className="animate-spin" /> Entrando…</> : "Entrar"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
