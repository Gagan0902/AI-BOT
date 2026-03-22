import { HfInference } from '@huggingface/inference';

if (!process.env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY === 'your_api_key_here') {
    throw new Error('HUGGINGFACE_API_KEY is not defined or is set to the default placeholder. Please update your .env.local file.');
}

export const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const DEFAULT_MODEL = process.env.NEXT_PUBLIC_MODEL_ID || 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export const SYSTEM_PROMPT = `You are a highly intelligent, professional, and helpful AI assistant.
Your goal is to provide accurate, clear, and comprehensive answers to any question.
You excel at:
1. Writing and debugging code (use Markdown for code blocks).
2. Explaining complex topics simply.
3. Providing financial and technical advice with proper context.
4. Being creative and concise.

Always use Markdown for formatting. If asked about financial decisions, provide helpful information but include a disclaimer to consult a professional for specific advice.`;
