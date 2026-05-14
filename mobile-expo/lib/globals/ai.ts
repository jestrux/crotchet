const BACKEND_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? '';

export async function promptAI(prompt: string, opts?: { context?: string }): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context: opts?.context }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.response ?? data?.text ?? data ?? null;
  } catch {
    return null;
  }
}
