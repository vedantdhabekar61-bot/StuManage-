import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    const supabaseAdmin = getSupabaseAdmin();
    
    // Get the secure, verified user from the session using the passed token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token || '');
    
    // Block unauthorized requests before processing anything else
    if (!user || userError) {
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
