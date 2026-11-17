/** sessionStorage flag after a successful /api/access check (this tab). */
export const ACCESS_SESSION_KEY = "fas-access-unlocked";

/**
 * What a password unlocks. Undefined = the shared Site Settings password
 * (every protected study without its own password, About CV / Resume).
 * `own: true` = a case study with its own password (Studio → the study →
 * "Own password", Fas Nov 16 evening) — the shared password doesn't open it
 * and its unlock is kept apart from the shared one.
 */
export type AccessScope = { slug: string; own: boolean } | undefined;

function storageKey(scope: AccessScope) {
  return scope?.own ? `${ACCESS_SESSION_KEY}:${scope.slug}` : ACCESS_SESSION_KEY;
}

export function readAccessUnlocked(scope?: AccessScope): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(storageKey(scope)) === "1";
  } catch {
    return false;
  }
}

export function writeAccessUnlocked(scope?: AccessScope): void {
  try {
    sessionStorage.setItem(storageKey(scope), "1");
  } catch {
    /* private mode / blocked storage */
  }
}

/** Validate password via the server route; persists unlock for this session. */
export async function verifyAccessPassword(
  password: string,
  scope?: AccessScope,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, slug: scope?.slug }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      scope?: "study" | "site";
    };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "Incorrect password." };
    }
    writeAccessUnlocked(
      data.scope === "study" && scope ? { slug: scope.slug, own: true } : undefined,
    );
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not check the password right now." };
  }
}
