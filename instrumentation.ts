// Runs once at server boot (Next.js instrumentation hook). Importing lib/env
// here — rather than waiting for the first module that happens to need a var —
// makes a missing/misconfigured env var fail fast with a readable message
// instead of surfacing later as a cryptic runtime error inside Prisma/Kinde/R2.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/env");
  }
}
