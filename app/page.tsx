import { Wizard } from "@/components/Wizard";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center border border-ink text-[11px] font-medium">
              砚
            </span>
            <div>
              <p className="text-[13px] font-medium leading-none">职业规划报告</p>
              <p className="mt-1 text-[11px] text-muted">IT 岗位 · 方法论固定 · 仅存本机</p>
            </div>
          </div>
          <p className="hidden max-w-xs text-right text-[11px] leading-5 text-muted sm:block">
            不编造雇主、薪资或通过率。要求来自公开 JD 的常见结构。
          </p>
        </div>
      </header>
      <main className="flex-1">
        <Wizard />
      </main>
    </div>
  );
}
