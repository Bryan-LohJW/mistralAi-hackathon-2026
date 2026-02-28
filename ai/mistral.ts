import Mistral from '@mistralai/mistralai';

if (!process.env.MISTRAL_API_KEY) {
  console.warn('[Mistral] MISTRAL_API_KEY is not set. AI features will not work.');
}

export const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY ?? 'missing-key',
});

/** General-purpose large model for reasoning tasks */
export const TEXT_MODEL = 'mistral-large-latest';

/** Fast smaller model for simpler extraction tasks */
export const SMALL_MODEL = 'mistral-small-latest';

/** Code-specialised model for technical interview stages */
export const CODE_MODEL = 'codestral-latest';

/** Parse a JSON string from a Mistral response, with a fallback error */
export function parseJSON<T>(content: string | null | undefined): T {
  if (!content) throw new Error('Empty response from Mistral');
  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error(`Failed to parse Mistral JSON response: ${content?.slice(0, 200)}`);
  }
}
