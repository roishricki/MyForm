import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const plans = await db.query('SELECT * FROM plans ORDER BY monthly_price ASC');
    const default_plan_id = await db.query('SELECT value FROM app_config WHERE key = $1', ['default_plan_id']);

    const result = {
      plans: plans.rows,
      default_plan_id: default_plan_id.rows
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
  }
}