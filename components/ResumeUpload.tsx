"use client";

import {
  RESUME_ACCEPT,
  extractResumeText,
  formatFileSize,
  mergeResumeIntoBackground,
} from "@/lib/resume-file";
import type { UserBackground } from "@/lib/types";
import { useRef, useState } from "react";
import { Button } from "./ui";

type Status =
  | { kind: "idle" }
  | { kind: "parsing"; name: string; size: number }
  | { kind: "success"; name: string; size: number; chars: number; note?: string; addedSkills: number }
  | { kind: "error"; message: string; name?: string; size?: number };

export function ResumeUpload({
  background,
  onChange,
}: {
  background: UserBackground;
  onChange: (next: UserBackground) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previousRef = useRef<{ resumeText: string; techStack: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<"replace" | "append">("replace");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [canUndo, setCanUndo] = useState(false);

  const applyFile = async (file: File | undefined) => {
    if (!file) return;
    setStatus({ kind: "parsing", name: file.name, size: file.size });
    try {
      const parsed = await extractResumeText(file);
      previousRef.current = {
        resumeText: background.resumeText,
        techStack: [...background.techStack],
      };
      setCanUndo(true);
      const merged = mergeResumeIntoBackground(parsed.text, background.resumeText, background.techStack, mode);
      const addedSkills = Math.max(0, merged.techStack.length - background.techStack.length);
      onChange({ ...background, ...merged });
      setStatus({
        kind: "success",
        name: file.name,
        size: file.size,
        chars: parsed.text.length,
        note: parsed.warning,
        addedSkills,
      });
    } catch (error) {
      setStatus({
        kind: "error",
        name: file.name,
        size: file.size,
        message: error instanceof Error ? error.message : "解析失败。",
      });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const undo = () => {
    if (!previousRef.current) return;
    onChange({ ...background, ...previousRef.current });
    previousRef.current = null;
    setCanUndo(false);
    setStatus({ kind: "idle" });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink">上传简历</p>
          <p className="mt-1 text-xs leading-5 text-muted">支持 PDF、DOCX、TXT、Markdown。旧版 .doc 请先另存为 .docx。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>载入方式</span>
          <button
            type="button"
            onClick={() => setMode("replace")}
            className={`rounded-sm border px-2.5 py-1 ${
              mode === "replace" ? "border-ink bg-accent-soft text-ink" : "border-line bg-white"
            }`}
          >
            替换
          </button>
          <button
            type="button"
            onClick={() => setMode("append")}
            className={`rounded-sm border px-2.5 py-1 ${
              mode === "append" ? "border-ink bg-accent-soft text-ink" : "border-line bg-white"
            }`}
          >
            追加
          </button>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void applyFile(event.dataTransfer.files[0]);
        }}
        className={`cursor-pointer rounded-sm border border-dashed px-4 py-6 text-center transition-colors ${
          dragOver ? "border-ink bg-accent-soft" : "border-line bg-paper/60 hover:border-ink/40"
        }`}
      >
        <p className="text-[13px] font-medium">选择文件或拖放到此处</p>
        <p className="mt-1 text-xs text-muted">建议 6MB 以内；超过 15MB 会拒绝。也可继续在下方粘贴。</p>
        <Button
          type="button"
          variant="outline"
          className="mt-3 min-h-10 min-w-[8rem]"
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          选择简历文件
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={RESUME_ACCEPT}
        className="sr-only"
        onChange={(event) => void applyFile(event.target.files?.[0])}
      />

      {status.kind === "parsing" ? (
        <p className="border border-hair bg-hair px-3 py-2 text-[13px] text-ink">
          解析中… {status.name}（{formatFileSize(status.size)}）
        </p>
      ) : null}

      {status.kind === "success" ? (
        <div className="border border-ok/20 bg-ok-soft px-3 py-2 text-[13px] leading-6 text-ok">
          <p>
            已从文件载入 {status.chars} 字
            {status.addedSkills > 0 ? `，并识别出 ${status.addedSkills} 项技能` : ""}。
          </p>
          <p className="text-xs">
            {status.name} · {formatFileSize(status.size)} · {mode === "append" ? "已追加" : "已替换原文"}
          </p>
          {status.note ? <p className="text-xs text-warn">{status.note}</p> : null}
          {canUndo ? (
            <button type="button" className="mt-1 text-xs underline underline-offset-2" onClick={undo}>
              撤销本次载入
            </button>
          ) : null}
        </div>
      ) : null}

      {status.kind === "error" ? (
        <p className="border border-danger/20 bg-danger-soft px-3 py-2 text-[13px] leading-6 text-danger">
          {status.name ? `${status.name}：` : ""}
          {status.message}
        </p>
      ) : null}

      <p className="text-xs leading-5 text-muted">文件仅在本机浏览器解析，不会上传到服务器。</p>
    </div>
  );
}
