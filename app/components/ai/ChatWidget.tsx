"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Loader2, Map as MapIcon, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Link } from "@/i18n/navigation";

const transport = new DefaultChatTransport({ api: "/api/chat" });
const TEASER_SEEN_KEY = "wl-chat-teaser-seen";
// The admin console has its own chrome, and the planner page is itself the AI experience.
const HIDDEN_ON = /\/(admin|plan)(\/|$)/;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * /api/chat answers failures with a JSON body like { error: "AI_NOT_CONFIGURED" },
 * and the transport surfaces that body verbatim as the Error's message.
 */
function errorCodeOf(error: Error | undefined): string | null {
  if (!error) return null;
  try {
    const code = JSON.parse(error.message)?.error;
    return typeof code === "string" ? code : "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

/** A dashed travel route drifting slowly behind the header. */
function RouteLine() {
  const reduce = useReducedMotion();
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full text-cyan-400/30"
    >
      <motion.path
        d="M-10 80 C 60 20, 130 100, 210 50 S 330 0, 410 45"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 7"
        animate={reduce ? undefined : { strokeDashoffset: [0, -110] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
      <circle cx="210" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}

export default function ChatWidget() {
  const t = useTranslations("AIChat");
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { isAuthenticated, isLoading } = useKindeBrowserClient();
  const { messages, sendMessage, status, error, clearError } = useChat({ transport });
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const hidden = HIDDEN_ON.test(pathname);
  const busy = status === "submitted" || status === "streaming";
  const errorCode = errorCodeOf(error);
  const canChat = Boolean(isAuthenticated) && errorCode !== "UNAUTHENTICATED";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, status, open, reduce]);

  // Scroll-to-top steps aside while the panel is open (see scrollToTop.tsx).
  useEffect(() => {
    const root = document.documentElement;
    if (open) root.dataset.chatOpen = "true";
    else delete root.dataset.chatOpen;
    return () => {
      delete root.dataset.chatOpen;
    };
  }, [open]);

  // Same for the teaser, which sits where scroll-to-top would.
  useEffect(() => {
    const root = document.documentElement;
    if (teaser && !open) root.dataset.chatTeaser = "true";
    else delete root.dataset.chatTeaser;
    return () => {
      delete root.dataset.chatTeaser;
    };
  }, [teaser, open]);

  // One gentle teaser per session, a few seconds after landing.
  useEffect(() => {
    if (hidden) return;
    try {
      if (sessionStorage.getItem(TEASER_SEEN_KEY)) return;
    } catch {
      return; // storage blocked — skip the teaser
    }
    const id = window.setTimeout(() => setTeaser(true), 6000);
    return () => window.clearTimeout(id);
  }, [hidden]);

  if (hidden) return null;

  function markTeaserSeen() {
    setTeaser(false);
    try {
      sessionStorage.setItem(TEASER_SEEN_KEY, "1");
    } catch {
      // storage blocked — the teaser may show again next visit, which is fine
    }
  }

  function toggle() {
    markTeaserSeen();
    setOpen((value) => !value);
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (error) clearError();
    void sendMessage({ text: trimmed });
    setInput("");
  }

  const suggestions = [t("suggestion1"), t("suggestion2"), t("suggestion3")];
  const reveal = { clipPath: "circle(150% at 92% 100%)", opacity: 1 };
  const hide = { clipPath: "circle(0% at 92% 100%)", opacity: 0.4 };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label={t("title")}
            initial={reduce ? { opacity: 0 } : hide}
            animate={reduce ? { opacity: 1 } : reveal}
            exit={reduce ? { opacity: 0 } : hide}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed bottom-28 right-4 z-[55] flex h-[42rem] max-h-[calc(100dvh-8.5rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-neutral-900/25 ring-1 ring-neutral-900/5 sm:right-8 sm:w-[26rem]"
          >
            <header className="relative overflow-hidden bg-neutral-900 px-5 pb-5 pt-5 text-white">
              <RouteLine />
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-cyan-500">
                    <Sparkles className="h-5 w-5" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-neutral-900" />
                  </div>
                  <div>
                    <p className="font-semibold leading-tight">{t("title")}</p>
                    <p className="text-xs text-white/60">{t("subtitle")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href="/plan"
                    onClick={() => setOpen(false)}
                    title={t("planCta")}
                    aria-label={t("planCta")}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                  >
                    <MapIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label={t("close")}
                    className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </header>

            {/* data-lenis-prevent: keep Lenis smooth-scroll from hijacking this inner scroller */}
            <div ref={scrollRef} data-lenis-prevent className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 px-4 py-5">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              ) : !canChat ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                  <p className="text-sm text-neutral-600">{t("loginPrompt")}</p>
                  <NextLink
                    href="/api/auth/login"
                    className="rounded-full bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
                  >
                    {t("login")}
                  </NextLink>
                </div>
              ) : (
                <>
                  <Bubble role="assistant">{t("greeting")}</Bubble>

                  {messages.length === 0 && (
                    <>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {suggestions.map((suggestion, i) => (
                          <motion.button
                            key={suggestion}
                            initial={reduce ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 + i * 0.07, duration: 0.3, ease: EASE }}
                            onClick={() => send(suggestion)}
                            className="cursor-pointer rounded-full border border-cyan-200 bg-white px-3 py-2 text-left text-xs text-cyan-800 transition-colors hover:bg-cyan-50"
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>

                      <motion.div
                        initial={reduce ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.4, ease: EASE }}
                        className="!mt-5 overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                      >
                        <div className="flex items-start gap-3 p-4">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-50 text-cyan-700">
                            <MapIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{t("planCardTitle")}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{t("planCardBody")}</p>
                          </div>
                        </div>
                        <Link
                          href="/plan"
                          onClick={() => setOpen(false)}
                          className="group flex items-center justify-between bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                        >
                          {t("planCardCta")}
                          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                      </motion.div>
                    </>
                  )}

                  {messages.map((message) => {
                    const text = message.parts
                      .map((part) => (part.type === "text" ? part.text : ""))
                      .join("");
                    if (!text) return null;
                    return (
                      <Bubble key={message.id} role={message.role === "user" ? "user" : "assistant"}>
                        {text}
                      </Bubble>
                    );
                  })}

                  {status === "submitted" && (
                    <Bubble role="assistant">
                      <span className="inline-flex gap-1 py-1" aria-hidden>
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:120ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:240ms]" />
                      </span>
                    </Bubble>
                  )}

                  {errorCode && (
                    <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {errorCode === "AI_NOT_CONFIGURED"
                        ? t("notConfigured")
                        : errorCode === "RATE_LIMITED"
                          ? t("rateLimited")
                          : errorCode === "AI_DAILY_LIMIT"
                            ? t("dailyLimit")
                            : t("genericError")}
                    </p>
                  )}
                </>
              )}
            </div>

            {canChat && !isLoading && (
              <div className="border-t border-neutral-200 bg-white px-3 pb-3 pt-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="flex items-center gap-2 rounded-full bg-neutral-100 p-1 pl-4 focus-within:ring-2 focus-within:ring-cyan-500/40"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("placeholder")}
                    aria-label={t("placeholder")}
                    maxLength={1000}
                    className="min-w-0 flex-1 bg-transparent py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
                  />
                  <motion.button
                    type="submit"
                    whileTap={reduce ? undefined : { scale: 0.9 }}
                    disabled={busy || !input.trim()}
                    aria-label={t("send")}
                    className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-cyan-600 text-white transition-colors hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-neutral-300"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </motion.button>
                </form>
                <p className="mt-2 px-2 text-[10px] leading-tight text-neutral-400">{t("disclaimer")}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {teaser && !open && (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="hidden items-center gap-1 rounded-2xl bg-white py-2 pl-4 pr-1.5 text-sm text-neutral-800 shadow-xl ring-1 ring-neutral-900/5 sm:flex"
            >
              <button onClick={toggle} className="cursor-pointer text-left">
                {t("teaser")}
              </button>
              <button
                onClick={markTeaserSeen}
                aria-label={t("dismiss")}
                className="cursor-pointer rounded-md p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={toggle}
          whileTap={reduce ? undefined : { scale: 0.92 }}
          aria-label={open ? t("close") : t("open")}
          aria-expanded={open}
          className="relative grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-cyan-600 text-white shadow-xl shadow-cyan-900/30 ring-4 ring-white/25 transition-colors hover:bg-cyan-500"
        >
          {!open && !reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-cyan-500"
              initial={{ opacity: 0.55, scale: 1 }}
              animate={{ opacity: 0, scale: 1.75 }}
              transition={{ duration: 1.8, repeat: 2, delay: 1.2, ease: "easeOut" }}
            />
          )}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "chat"}
              initial={reduce ? false : { rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const isUser = role === "user";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8, x: isUser ? 14 : -14 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-cyan-600 text-white"
            : "rounded-bl-md border border-neutral-200 bg-white text-neutral-800"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
}
