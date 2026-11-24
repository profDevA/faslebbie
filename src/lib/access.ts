/** sessionStorage flag after a successful /api/access check (this tab). */
export const ACCESS_SESSION_KEY = "fas-access-unlocked";

/** About links that can have their own password (Studio → About Page → Links). */
export type AboutLockedLink = "cv" | "resume";

/**
 * What a password unlocks. Undefined or `own: false` = the shared Site
 * Settings password (every protected study without its own password, About
 * CV / Resume without their own).
 * `own: true` = a case study with its own password (Studio → the study →
 * "Own password", Fas Nov 16 evening) or the About CV / Resume with its own
 * (Studio → About Page → Links → "CV password" / "Resume password", Fas
 * Nov 23) — the shared password doesn't open it and its unlock is kept apart
 * from the shared one (`fas-access-unlocked:<slug>`, `:cv`, `:resume`).
 */
export type AccessScope =
  | { slug: string; own: boolean }
  | { link: AboutLockedLink; own: boolean }
  | undefined;

function storageKey(scope: AccessScope) {
  if (!scope?.own) return ACCESS_SESSION_KEY;
  return `${ACCESS_SESSION_KEY}:${"link" in scope ? scope.link : scope.slug}`;
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
      body: JSON.stringify({
        password,
        slug: scope && "slug" in scope ? scope.slug : undefined,
        link: scope && "link" in scope ? scope.link : undefined,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      scope?: "study" | "link" | "site";
    };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "Incorrect password." };
    }
    writeAccessUnlocked(
      (data.scope === "study" || data.scope === "link") && scope
        ? { ...scope, own: true }
        : undefined,
    );
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not check the password right now." };
  }
}
