import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "clay";
}) {
  const styles = {
    primary:
      "bg-celadon text-white hover:bg-celadon-deep disabled:bg-line disabled:text-sage",
    ghost: "text-ink hover:bg-paper disabled:text-sage",
    outline:
      "border border-line bg-card text-ink hover:border-celadon/40 hover:text-celadon-deep",
    clay: "bg-clay text-white hover:opacity-90",
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs leading-5 text-sage">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none ring-celadon/20 placeholder:text-sage/80 focus:border-celadon focus:ring-4 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none ring-celadon/20 placeholder:text-sage/80 focus:border-celadon focus:ring-4 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-celadon ${props.className ?? ""}`}
    />
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-celadon bg-celadon/10 text-celadon-deep"
          : "border-line bg-white text-muted hover:border-celadon/40"
      }`}
    >
      {children}
    </button>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-danger/10 text-danger",
    moderate: "bg-warn/10 text-warn",
    minor: "bg-sage/15 text-muted",
    met: "bg-ok/10 text-ok",
  };
  const label: Record<string, string> = {
    critical: "关键缺口",
    moderate: "需要补齐",
    minor: "加分缺口",
    met: "已具备",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs ${map[severity] ?? "bg-line text-muted"}`}>
      {label[severity] ?? severity}
    </span>
  );
}

export function FitBadge({ fit }: { fit: string }) {
  const map: Record<string, string> = {
    strong: "bg-ok/10 text-ok",
    transferable: "bg-celadon/10 text-celadon-deep",
    stretch: "bg-warn/10 text-warn",
    unknown: "bg-line text-muted",
  };
  const label: Record<string, string> = {
    strong: "较匹配",
    transferable: "可迁移",
    stretch: "跨度较大",
    unknown: "信息不足",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs ${map[fit] ?? "bg-line"}`}>
      {label[fit] ?? fit}
    </span>
  );
}
