'use server';
/**
 * @fileOverview Speech-to-text stub.
 *
 * Mistral AI does not have a native speech-to-text API.
 * This stub maintains the same exported interface so nothing else in the app breaks.
 * Replace with a real STT provider (e.g. OpenAI Whisper, Deepgram) when needed.
 *
 * - speechToText - Returns a placeholder transcript.
 * - SpeechToTextInput - The input type.
 * - SpeechToTextOutput - The return type.
 */

export type SpeechToTextInput = {
  audioDataUri: string;
};

export type SpeechToTextOutput = {
  transcript: string;
};

export async function speechToText(_input: SpeechToTextInput): Promise<SpeechToTextOutput> {
  // Mistral has no native STT — return a stub response.
  // To enable real transcription, integrate a provider such as OpenAI Whisper or Deepgram here.
  console.warn('speechToText: Mistral AI has no native STT. Returning stub transcript.');
  return {
    transcript: '[Speech-to-text is not available with the current AI provider. Please type your answer.]',
  };
}
