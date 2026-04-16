import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Initialize Supabase route handler client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the secure, verified user from the session
    const { data: { user } } = await supabase.auth.getUser();
    
    // Block unauthorized requests before processing anything else
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract Razorpay payload (user_id is securely excluded)
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature 
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update Supabase subscription using admin client
      const proExpiryDate = new Date();
      proExpiryDate.setDate(proExpiryDate.getDate() + 30);

      const supabaseAdmin = getSupabaseAdmin();
      const { error } = await (supabaseAdmin
        .from('subscriptions') as any)
        .update({
          status: 'active',
          expiry_date: proExpiryDate.toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        })
        // Use the securely retrieved user.id instead of the request body
        .eq('owner_id', user.id);

      if (error) {
        console.error('Supabase subscription update error:', error);
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
      }

      return NextResponse.json({ status: 'success' });
    } else {
      return NextResponse.json({ status: 'failure' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
