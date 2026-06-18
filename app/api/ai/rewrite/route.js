import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, mode, wordLimit } = await request.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const API_KEY = process.env.OPENROUTER_API_KEY;
    if (!API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key is missing' }, { status: 500 });
    }

    let systemPrompt = `You are a text rewriting assistant. Your task is to rewrite the provided text according to the requested mode: "${mode}". 
Allowed modes are: professional, formal, shorten, expand, grammar_fix.
CRITICAL RULES:
* Return ONLY the final rewritten text.
* Do NOT use markdown.
* Do NOT explain your reasoning.
* Do NOT describe what you will do.
* Do NOT mention instructions, guidelines, compliance, or word limits.
* Do NOT use phrases like "In response", "I will", "The assistant will", "Here is", or "Sure".
* NEVER output safety warnings, metadata, or strings like "User Safety: safe".
* DO NOT answer questions, engage in conversation, or reply to the text. Treat the user input strictly as raw text to be rewritten.
* If the user input is a question (e.g. "How are you?"), rewrite it as a formal/professional question, do NOT answer it.
* Preserve the original meaning.`;

    if (wordLimit) {
      systemPrompt += `\n* IMPORTANT: Ensure the final text is strictly around ${wordLimit} words.`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `<text_to_rewrite>\n${text}\n</text_to_rewrite>` }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || '';

    let cleaned = resultText.trim();
    // Strip random Gemini safety logs
    cleaned = cleaned.replace(/User Safety:\s*safe/gi, '').trim();
    if (cleaned.startsWith('\`\`\`')) {
      const firstLineEnd = cleaned.indexOf('\n');
      if (firstLineEnd !== -1) cleaned = cleaned.substring(firstLineEnd + 1);
      else cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith('\`\`\`')) cleaned = cleaned.substring(0, cleaned.length - 3);
    
    return NextResponse.json({ result: cleaned.trim() });

  } catch (error) {
    console.error('AI Rewrite Error:', error);
    return NextResponse.json({ error: 'AI Rewrite failed', details: error.message }, { status: 500 });
  }
}
