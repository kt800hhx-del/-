import type { ResourceRef } from "@/lib/types";
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
    primary: "bg-accent text-white hover:bg-accent/90 disabled:bg-line disabled:text-muted",
    ghost: "text-ink hover:bg-hair disabled:text-muted",
    outline: "border border-line bg-card text-ink hover:border-ink/40",
    clay: "bg-accent text-white hover:bg-accent/90",
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center rounded-sm px-4 py-2 text-[13px] font-medium transition-colors disabled:cursor-not-allowed ${styles} ${className}`}
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
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs leading-5 text-muted">{hint}</span> : null}
    </label>
  );
}

const control =
  "w-full rounded-sm border border-line bg-white px-3 py-2 text-[13px] outline-none placeholder:text-muted/70 focus:border-ink";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${control} ${props.className ?? ""}`} />;
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
      className={`rounded-sm border px-2.5 py-1 text-xs transition-colors ${
        active ? "border-accent bg-accent text-white" : "border-line bg-white text-muted hover:border-ink/30"
      }`}
    >
      {children}
    </button>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-danger-soft text-danger",
    moderate: "bg-warn-soft text-warn",
    minor: "bg-hair text-muted",
    met: "bg-ok-soft text-ok",
  };
  const label: Record<string, string> = {
    critical: "关键缺口",
    moderate: "需要补齐",
    minor: "加分缺口",
    met: "已对齐",
  };
  return (
    <span className={`inline-flex rounded-sm px-2 py-0.5 text-[11px] font-medium ${map[severity] ?? "bg-hair text-muted"}`}>
      {label[severity] ?? severity}
    </span>
  );
}

export function FitBadge({ fit }: { fit: string }) {
  const map: Record<string, string> = {
    strong: "bg-ok-soft text-ok",
    transferable: "bg-accent-soft text-accent",
    stretch: "bg-warn-soft text-warn",
    unknown: "bg-hair text-muted",
  };
  const label: Record<string, string> = {
    strong: "较匹配",
    transferable: "可迁移",
    stretch: "跨度较大",
    unknown: "信息不足",
  };
  return (
    <span className={`inline-flex rounded-sm px-2 py-0.5 text-[11px] font-medium ${map[fit] ?? "bg-hair"}`}>
      {label[fit] ?? fit}
    </span>
  );
}

export function ReportField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-hair pt-3">
      <p className="label">{label}</p>
      <div className="mt-2 text-[13px] leading-6 text-ink">{children}</div>
    </div>
  );
}

export function ResourceList({ resources }: { resources: ResourceRef[] }) {
  if (!resources.length) return null;
  return (
    <ul className="mt-2 space-y-3">
      {resources.map((res) => (
        <li key={`${res.url}-${res.name}`} className="text-[13px] leading-6">
          <span className="text-[11px] text-muted">{res.kind}</span>{" "}
          <a
            href={res.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0b57d0] underline underline-offset-2 hover:text-[#0842a0]"
          >
            {res.name}
          </a>
          <p className="break-all text-[11px] text-[#0b57d0]/80">{res.url}</p>
          <p className="text-muted">{res.note}</p>
        </li>
      ))}
    </ul>
  );
}

export function SectionTitle({ kicker, title, desc }: { kicker?: string; title: string; desc?: string }) {
  return (
    <header className="space-y-2">
      {kicker ? <p className="label">{kicker}</p> : null}
      <h2 className="font-serif text-[28px] leading-snug tracking-tight text-ink md:text-[32px]">{title}</h2>
      {desc ? <p className="max-w-2xl text-[13px] leading-6 text-muted">{desc}</p> : null}
    </header>
  );
}
