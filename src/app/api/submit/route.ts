import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, planType, isYearly, addOns } = body;

    await db.query('BEGIN');

    // Insert user
    const userResult = await db.query(
      'INSERT INTO users (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
      [name, email, phone]
    );
    const userId = userResult.rows[0].id;

    // Insert subscription
    const subscriptionResult = await db.query(
      'INSERT INTO subscriptions (user_id, plan_id, is_yearly) VALUES ($1, $2, $3) RETURNING id',
      [userId, planType, isYearly]
    );
    const subscriptionId = subscriptionResult.rows[0].id;

    // Insert add-ons
    if (addOns && addOns.length > 0) {
      for (const addonId of addOns) {
        await db.query(
          'INSERT INTO subscription_addons (subscription_id, addon_id) VALUES ($1, $2)',
          [subscriptionId, addonId]
        );
      }
    }

    await db.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription created successfully',
      data: { userId, subscriptionId }
    });
  } catch (error:any) {

    if(error.constraint == 'users_email_key') {
      // Handle duplicate email error
      await db.query('ROLLBACK');
      return NextResponse.json({
        success: false,
        error: 'This email address is already registered. Please use a different email or log in.',
        code: 'EMAIL_EXISTS'
      }, { status: 409 });
    }
    
    await db.query('ROLLBACK');
    console.error('Error submitting form:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to submit form' 
    }, { status: 500 });
  }
}