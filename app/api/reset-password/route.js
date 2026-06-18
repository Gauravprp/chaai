import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email } = await req.json();

    const response = await fetch('https://api.dyzo.ai/reset/link/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'dyzo_dev_8wczpjcvwyjztc8omzzhhfp176p950mwovvkp80v',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`Dyzo backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Proxy error resetting password:", err.message);
    return NextResponse.json({ status: 0, error: err.message }, { status: 500 });
  }
}
