import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI()],
  // Use a current model (gemini-1.5-flash 404s on v1beta; 2.5-flash is supported by the plugin)
  model: 'googleai/gemini-2.5-flash',
});
