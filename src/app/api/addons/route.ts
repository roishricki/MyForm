import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const addons = await db.query('SELECT * FROM addons ORDER BY monthly_price ASC');
    return NextResponse.json(addons.rows);
  } catch (error) {
    console.error('Error fetching addons:', error);
    return NextResponse.json({ error: 'Failed to fetch addons' }, { status: 500 });
  }
}