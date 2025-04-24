import { NextResponse } from 'next/server';

export async function POST() {
  const DAILY_API_KEY = process.env.DAILY_API_KEY;

  try {
    const res = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DAILY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          enable_chat: true,
          enable_knocking: false,
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour expiry
        },
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error('Failed to create Daily room:', error);
    return NextResponse.json({ error: 'Room creation failed' }, { status: 500 });
  }
}
