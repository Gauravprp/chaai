import { NextResponse } from 'next/server';

// Simple in-memory cache for API responses to optimize performance
const responseCache = new Map();

// Helper to clean JSON string from LLM response (in case it includes markdown backticks)
function cleanJsonString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export async function POST(request) {
  try {
    const { text, action, targetLanguage = 'English', tone = 'Professional', defaultLang = 'Hindi' } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    // Generate cache key
    const cacheKey = `${action}:${text.trim()}:${targetLanguage}:${tone}:${defaultLang}`;
    if (responseCache.has(cacheKey)) {
      return NextResponse.json(responseCache.get(cacheKey));
    }

    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3:8b';

    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'translate') {
      systemPrompt = `You are a professional, high-fidelity translator. Translate the text exactly into ${targetLanguage}. 
You must auto-detect the source language. 
Preserve formatting, emojis, HTML/markdown tags, URLs, mentions (like @username), and special characters exactly. 
Return the result strictly as a JSON object:
{
  "translation": "translated text here",
  "detectedSourceLanguage": "name of source language"
}`;
      userPrompt = `Translate this text: "${text}"`;
    } else if (action === 'tone') {
      systemPrompt = `You are a real-time tone changer. Rewrite the text into multiple tones. Keep the core meaning the same.
Return a JSON object with these exact keys:
{
  "tones": {
    "Professional": "...",
    "Friendly": "...",
    "Formal": "...",
    "Casual": "...",
    "Concise": "...",
    "Persuasive": "...",
    "Polite": "...",
    "Human-like": "..."
  }
}`;
      userPrompt = `Rewrite this text in multiple tones: "${text}"`;
    } else if (action === 'grammar') {
      systemPrompt = `You are an expert grammar editor. Fix any spelling, punctuation, grammar, and sentence structure issues.
Return a JSON object with this structure:
{
  "correctedText": "corrected version here",
  "correctionsList": ["list of corrected errors or explanation of what was fixed"]
}`;
      userPrompt = `Fix the grammar of this text: "${text}"`;
    } else if (action === 'compose') {
      systemPrompt = `You are a smart text completion assistant. Suggest 3 distinct ways to complete, continue, or expand the user's unfinished sentence or message.
Return a JSON object with this structure:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}`;
      userPrompt = `Complete or expand this message: "${text}"`;
    } else if (action === 'all') {
      // Combined helper for real-time typing panel
      systemPrompt = `You are an AI-powered real-time writing assistant. Analyze the user's text and provide grammar fixes, sentence completions, tone variations, and translation.
Return a JSON object with this exact structure:
{
  "grammar": {
    "correctedText": "corrected version here (or same text if no grammar issues)",
    "hasErrors": true/false
  },
  "completion": "suggested completion or continuation for the sentence",
  "tones": {
    "Professional": "professional version",
    "Casual": "casual version",
    "Concise": "concise version",
    "Friendly": "friendly version"
  },
  "translation": {
    "translatedText": "translation into ${targetLanguage}",
    "detectedLanguage": "detected source language"
  }
}`;
      userPrompt = `Analyze and process this text: "${text}"`;
    } else {
      // Default / Rewrite action
      systemPrompt = `You are a writing assistant. Fix grammar, spelling, punctuation, clarity, and provide variations.
Return a JSON object with this structure:
{
  "correctedText": "clarified and corrected text",
  "tones": {
    "Professional": "...",
    "Friendly": "...",
    "Formal": "...",
    "Casual": "...",
    "Concise": "...",
    "Persuasive": "...",
    "Polite": "...",
    "Human-like": "..."
  }
}`;
      userPrompt = `Rewrite, correct, and provide variations for this text: "${text}"`;
    }

    // Call local Ollama chat API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt + '\nIMPORTANT: Output ONLY the requested JSON. No extra commentary or introductions.' },
          { role: 'user', content: userPrompt }
        ],
        format: 'json',
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 256 // limit tokens to optimize speed
        }
      }),
      signal: controller.signal
    }).catch(err => {
      if (err.name === 'AbortError') {
        throw new Error('Ollama request timed out after 15 seconds.');
      }
      throw err;
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const responseData = await response.json();
    const messageContent = responseData.message?.content || '';
    const cleanContent = cleanJsonString(messageContent);
    const resultJson = JSON.parse(cleanContent);

    // Save to cache
    responseCache.set(cacheKey, resultJson);

    return NextResponse.json(resultJson);

  } catch (error) {
    console.error('Ollama Service Error:', error);
    return NextResponse.json({
      error: 'Ollama connection failure',
      details: 'Ollama is unreachable. Please make sure Ollama is running locally (e.g. `ollama serve`) and the model is downloaded.',
      rawMessage: error.message
    }, { status: 503 });
  }
}
