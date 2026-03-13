import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      user_id 
    } = await req.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Update Supabase profile
      const proExpiryDate = new Date();
      proExpiryDate.setDate(proExpiryDate.getDate() + 30);

      const { error } = await supabase
        .from('profiles')
        .update({
          is_pro: true,
          pro_expiry_date: proExpiryDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id);

      if (error) {
        console.error('Supabase profile update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
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
