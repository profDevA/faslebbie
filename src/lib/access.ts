/** sessionStorage flag after a successful /api/access check (this tab). */
export const ACCESS_SESSION_KEY = "fas-access-unlocked";

export function readAccessUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ACCESS_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function writeAccessUnlocked(): void {
  try {
    sessionStorage.setItem(ACCESS_SESSION_KEY, "1");
  } catch {
    /* private mode / blocked storage */
  }
}

/** Validate password via the server route; persists unlock for this session. */
export async function verifyAccessPassword(
  password: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "Incorrect password." };
    }
    writeAccessUnlocked();
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not check the password right now." };
  }
}
