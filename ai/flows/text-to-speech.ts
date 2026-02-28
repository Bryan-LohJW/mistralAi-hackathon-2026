'use server';
/**
 * @fileOverview Text-to-speech stub.
 *
 * Mistral AI does not have a native text-to-speech API.
 * This stub maintains the same exported interface so nothing else in the app breaks.
 * Replace with a real TTS provider (e.g. ElevenLabs, OpenAI TTS) when needed.
 *
 * - textToSpeech - Returns an empty audio data URI.
 * - TextToSpeechInput - The input type.
 * - TextToSpeechOutput - The return type.
 */

export type TextToSpeechInput = {
  text: string;
  voiceName?: string;
};

export type TextToSpeechOutput = {
  audioDataUri: string;
};

export async function textToSpeech(_input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  // Mistral has no native TTS — return a stub response.
  // To enable real audio generation, integrate a provider such as ElevenLabs or OpenAI TTS here.
  console.warn('textToSpeech: Mistral AI has no native TTS. Returning empty audio URI.');
  return {
    audioDataUri: '',
  };
}
