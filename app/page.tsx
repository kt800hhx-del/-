import { Wizard } from "@/components/Wizard";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-line/80">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs tracking-[0.28em] text-celadon">CAREER INKSTONE</p>
            <h1 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">职业规划砚台</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted">
              一套固定的 IT 职业规划方法：背景是输入，岗位要求来自常见招聘描述结构，输出是可验证的补齐路径。
            </p>
          </div>
          <p className="max-w-xs text-xs leading-6 text-sage">
            不编造公司名，不编造薪资或通过率。数据只存在你的浏览器里。
          </p>
        </div>
      </header>
      <main className="flex-1">
        <Wizard />
      </main>
    </div>
  );
}
