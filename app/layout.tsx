import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "职业规划报告 · IT 路径",
  description:
    "面向导师可出示的 IT 职业规划报告：岗位要求带依据类型，差距带证据，路径带周级任务与行业先例。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full font-sans text-ink">{children}</body>
    </html>
  );
}
