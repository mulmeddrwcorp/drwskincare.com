import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://drwgroup.id/apis/reseller/get', {
      headers: {
        'Authorization': 'Bearer c5d46484b83e6d90d2c55bc7a0ec9782493a1fa2434b66ebed36c3e668f74e89',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return NextResponse.json({ data });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching resellers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resellers' },
      { status: 500 }
    );
  }
}
