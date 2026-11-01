import { browserStorage, currentCampaign, withCampaign } from '../lib/campaign';

/**
 * Posts flat fields to the Formspree endpoint, plus the campaign tag when the visitor arrived through a
 * tagged link. Resolves true only when Formspree accepted them.
 */
export async function sendFields(endpoint: string, fields: Readonly<Record<string, string>>): Promise<boolean> {
  const body = new FormData();
  const tagged = withCampaign(fields, currentCampaign(browserStorage()));
  for (const [name, value] of Object.entries(tagged)) body.append(name, value);
  try {
    const response = await fetch(endpoint, { method: 'POST', body, headers: { Accept: 'application/json' } });
    return response.ok;
  } catch {
    return false;
  }
}
