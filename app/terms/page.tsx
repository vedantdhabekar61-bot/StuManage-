'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 pb-24">
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5F5243] shadow-soft transition-all active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-[#1a1a1a]">Terms of Service</h1>
      </header>

      <div className="mx-auto max-w-2xl bg-white rounded-[2rem] p-8 shadow-soft border border-black/5">
        <div className="flex items-center gap-3 mb-6 text-[#0ea495]">
          <FileText className="h-6 w-6" />
          <span className="font-bold text-sm uppercase tracking-widest">Legal Agreement</span>
        </div>

        <div className="prose prose-slate max-w-none text-[#5F5243] text-sm leading-relaxed">
          <p className="italic mb-8">Last Updated: May 21, 2026</p>

          <p className="mb-6">
            Welcome to <strong>StuManage</strong> ("App", "we", "our", or "us"). By creating an account or using our
            App, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          <section className="mb-8">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">1. Description of Service</h2>
            <p>
              StuManage is a subscription-based software application that helps reading room operators,
              tuition centers, and study library owners manage student records, seat allocation, fee
              collection reminders, and monthly revenue tracking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">2. Eligibility</h2>
            <p>
              You must be at least 18 years old and operate a legitimate educational or study facility to
              use this App. By registering, you confirm that all information you provide is accurate and
              that you have the right to manage the student data you enter.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">3. Subscription and Billing</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>New accounts receive a <strong>30-day free trial</strong> with full access to all features.</li>
              <li>After the trial period, continued use requires a paid subscription of <strong>₹50 per month</strong>.</li>
              <li>Payments are processed securely through Razorpay. We do not store your card or banking details.</li>
              <li>Subscriptions are billed monthly and are <strong>non-refundable</strong> once the payment period has begun.</li>
              <li>If your subscription lapses, you will lose access to the App until you renew.</li>
              <li>We reserve the right to change pricing with <strong>30 days' prior notice</strong> via email or in-app notification.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">4. User Responsibilities</h2>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Keep your login credentials secure and not share them with others.</li>
              <li>Enter only accurate and lawful student data into the App.</li>
              <li>Obtain appropriate consent from students or guardians before entering their personal information, as required under applicable Indian law including the Digital Personal Data Protection Act, 2023 (DPDP Act).</li>
              <li>Use the WhatsApp reminder feature only for legitimate fee communication and not for spam or unsolicited messages.</li>
              <li>Not attempt to reverse-engineer, resell, or copy any part of the App.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">5. Data Ownership</h2>
            <p>
              You own all student data you enter into StuManage. We act only as a data processor on your
              behalf. We will not access, use, or share your student data for any purpose other than
              providing the App's features to you. You may export or delete your data at any time by
              contacting support.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">6. Prohibited Uses</h2>
            <p className="mb-2">You must not use StuManage to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Store sensitive personal data beyond what is needed for fee management (e.g., Aadhaar numbers, financial account details).</li>
              <li>Send bulk unsolicited commercial messages via WhatsApp.</li>
              <li>Conduct any activity that violates Indian law or applicable regulations.</li>
              <li>Attempt to gain unauthorized access to our systems or another user's account.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">7. Availability and Modifications</h2>
            <p>
              We aim for high availability but do not guarantee uninterrupted service. We may modify,
              suspend, or discontinue any part of the App with reasonable notice. We are not liable for
              any loss arising from planned or unplanned downtime.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">8. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, StuManage and its creators shall not be liable for
              any indirect, incidental, or consequential damages arising from your use of the App,
              including but not limited to loss of student data, missed payment collections, or business
              interruption. Our total liability shall not exceed the amount you paid for the App in the
              three months preceding the claim.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">9. Termination</h2>
            <p>
              You may delete your account at any time by contacting support. We may terminate your
              account if you violate these Terms. Upon termination, your data will be retained for 30 days
              before permanent deletion, during which you may request an export.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3">10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of India. Any disputes shall be subject to the
              exclusive jurisdiction of courts in Nagpur, Maharashtra, India.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm">For questions about these Terms, contact:</p>
            <p className="font-bold text-[#0ea495]">support@stumanage.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}