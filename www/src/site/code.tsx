import * as React from "react"
import { cn } from "@/lib/utils"
import { IconCheck, IconCopy } from "./icons"

const KW = /\b(import|from|export|const|let|function|return|if|else|type|interface|extends|default|as|new|true|false|null|undefined|await|async|for|of|in)\b/

/** Very small TSX/shell highlighter: comments, strings, keywords, tags, numbers. */
function highlight(src: string) {
  const re = /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Z][A-Za-z.]*|<\/?[a-z][a-z0-9-]*(?=[\s>/]))|\b(\d+(?:\.\d+)?)\b|(\b[a-zA-Z_]+\b)/gm
  const out: React.ReactNode[] = []
  let last = 0, m: RegExpExecArray | null, i = 0
  while ((m = re.exec(src))) {
    if (m.index > last) out.push(src.slice(last, m.index))
    const [t, com, str, tag, num, word] = m
    if (com) out.push(<span key={i++} className="tk-c">{com}</span>)
    else if (str) out.push(<span key={i++} className="tk-s">{str}</span>)
    else if (tag) out.push(<span key={i++} className="tk-t">{tag}</span>)
    else if (num) out.push(<span key={i++} className="tk-n">{num}</span>)
    else if (word && KW.test(word)) out.push(<span key={i++} className="tk-k">{word}</span>)
    else out.push(t)
    last = m.index + t.length
  }
  out.push(src.slice(last))
  return out
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [done, setDone] = React.useState(false)
  return (
    <button
      type="button"
      aria-label="Copy"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true)
          setTimeout(() => setDone(false), 1400)
        }).catch(() => {})
      }}
      className={cn(
        "grid size-8 cursor-pointer place-items-center rounded-[10px] bg-surface text-muted shadow-key transition-[scale,box-shadow,color] duration-200 ease-spring hover:text-ink active:scale-95 active:shadow-inset-sm [&_svg]:size-3.5",
        done && "text-ok",
        className,
      )}
    >
      {done ? <IconCheck /> : <IconCopy />}
    </button>
  )
}

export function Code({ code, className, maxHeight }: { code: string; className?: string; maxHeight?: number }) {
  return (
    <div className={cn("code-block relative rounded-2xl bg-bg shadow-inset", className)}>
      <CopyButton text={code} className="absolute right-3 top-3 z-10" />
      <pre
        className="overflow-auto p-5 pr-14 max-sm:pt-12 font-mono text-[12.5px] leading-relaxed text-ink/85"
        style={{ maxHeight }}
      >
        <code>{highlight(code.trim())}</code>
      </pre>
    </div>
  )
}

/** One-line shell command with a prompt and copy button. */
export function Command({ cmd, className }: { cmd: string; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 rounded-[14px] bg-bg py-2 pl-4 pr-2 text-left shadow-inset", className)}>
      <span className="font-mono text-[13px] text-glow-ink">$</span>
      <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] max-sm:break-all max-sm:text-[12px] sm:whitespace-nowrap">{cmd}</code>
      <CopyButton text={cmd} />
    </div>
  )
}
