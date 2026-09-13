import { extractSkillsFromText, uniqueNormalized } from "./match";

export const RESUME_WARN_BYTES = 6 * 1024 * 1024;
export const RESUME_MAX_BYTES = 15 * 1024 * 1024;

export const RESUME_ACCEPT = ".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown";

export type ResumeKind = "pdf" | "docx" | "txt" | "md";

export class ResumeParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ResumeParseError";
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extOf(file: File): string {
  const fromName = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".") + 1) : "";
  return fromName.toLowerCase();
}

export function classifyResumeFile(file: File): ResumeKind | "doc" | "unknown" {
  const ext = extOf(file);
  const mime = (file.type || "").toLowerCase();

  if (ext === "doc" || mime === "application/msword") return "doc";
  if (ext === "pdf" || mime === "application/pdf") return "pdf";
  if (ext === "docx" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return "docx";
  }
  if (ext === "md" || mime === "text/markdown") return "md";
  if (ext === "txt" || mime === "text/plain") return "txt";
  return "unknown";
}

export function validateResumeFile(file: File): { kind: ResumeKind; warning?: string } {
  if (file.size <= 0) {
    throw new ResumeParseError("文件是空的，请换一份再试。");
  }
  if (file.size > RESUME_MAX_BYTES) {
    throw new ResumeParseError(
      `文件过大（${formatFileSize(file.size)}）。请压缩到 ${formatFileSize(RESUME_MAX_BYTES)} 以内，或改用 TXT / 粘贴原文。`,
    );
  }

  const kind = classifyResumeFile(file);
  if (kind === "doc") {
    throw new ResumeParseError("不支持旧版 .doc。请在 Word 中另存为 .docx，或导出 PDF / TXT 后再上传。");
  }
  if (kind === "unknown") {
    throw new ResumeParseError("不支持该文件类型。请上传 PDF、DOCX、TXT 或 Markdown。");
  }

  const warning =
    file.size >= RESUME_WARN_BYTES
      ? `文件较大（${formatFileSize(file.size)}），本机解析可能较慢。`
      : undefined;

  return { kind, warning };
}

function normalizeExtracted(text: string): string {
  return text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function textContentToString(items: unknown[]): string {
  let lastY: number | null = null;
  const parts: string[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object" || !("str" in item)) continue;
    const str = String((item as { str: string }).str);
    if (!str) continue;
    const transform = "transform" in item ? (item as { transform?: number[] }).transform : undefined;
    const y = transform && transform.length >= 6 ? transform[5] : null;
    if (lastY !== null && y !== null && Math.abs(y - lastY) > 2) {
      parts.push("\n");
    } else if (parts.length && !/\s$/.test(parts[parts.length - 1]) && !/^\s/.test(str)) {
      parts.push(" ");
    }
    parts.push(str);
    if (y !== null) lastY = y;
  }
  return parts.join("").replace(/[ \t]+\n/g, "\n").trim();
}

async function parsePdf(data: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.mjs`;
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(data) });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const line = textContentToString(content.items);
    if (line) pages.push(line);
  }
  return pages.join("\n\n");
}

async function parseDocx(data: ArrayBuffer): Promise<string> {
  const mod = await import("mammoth");
  const mammoth = mod.default ?? mod;
  const result = await mammoth.extractRawText({ arrayBuffer: data });
  return result.value;
}

function readPlainText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new ResumeParseError("读取文本失败，请重试或改为粘贴原文。"));
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.readAsText(file);
  });
}

export async function extractResumeText(file: File): Promise<{ text: string; kind: ResumeKind; warning?: string }> {
  const { kind, warning } = validateResumeFile(file);

  let raw = "";
  try {
    if (kind === "txt" || kind === "md") {
      raw = await readPlainText(file);
    } else if (kind === "pdf") {
      raw = await parsePdf(await file.arrayBuffer());
    } else {
      raw = await parseDocx(await file.arrayBuffer());
    }
  } catch (error) {
    if (error instanceof ResumeParseError) throw error;
    throw new ResumeParseError("解析失败。请确认文件未损坏，或改为粘贴简历原文。");
  }

  const text = normalizeExtracted(raw);
  if (!text) {
    throw new ResumeParseError("未能从文件中读出文字。扫描件 PDF 需要先转成文字版，或直接粘贴原文。");
  }

  return { text, kind, warning };
}

export function mergeResumeIntoBackground(
  resumeText: string,
  currentResume: string,
  currentStack: string[],
  mode: "replace" | "append",
): { resumeText: string; techStack: string[] } {
  const nextResume =
    mode === "append" && currentResume.trim()
      ? `${currentResume.trim()}\n\n${resumeText}`
      : resumeText;
  return {
    resumeText: nextResume,
    techStack: uniqueNormalized([...currentStack, ...extractSkillsFromText(nextResume)]),
  };
}
