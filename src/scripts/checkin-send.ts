/** Posts flat fields to the Formspree endpoint. Resolves true only when Formspree accepted them. */
export async function sendFields(endpoint: string, fields: Readonly<Record<string, string>>): Promise<boolean> {
  const body = new FormData();
  for (const [name, value] of Object.entries(fields)) body.append(name, value);
  try {
    const response = await fetch(endpoint, { method: 'POST', body, headers: { Accept: 'application/json' } });
    return response.ok;
  } catch {
    return false;
  }
}
