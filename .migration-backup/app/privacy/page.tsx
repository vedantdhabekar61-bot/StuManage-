'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
        <h1 className="text-xl font-bold text-[#1a1a1a]">Privacy Policy</h1>
      </header>

      <div className="mx-auto max-w-2xl bg-white rounded-[2rem] p-8 shadow-soft border border-black/5">
        <div className="flex items-center gap-3 mb-6 text-[#0ea495]">
          <Shield className="h-6 w-6" />
          <span className="font-bold text-sm uppercase tracking-widest">Compliance & Trust</span>
        </div>

        <div className="prose prose-slate max-w-none text-[#5F5243]">
          <p className="text-sm italic mb-8">Last Updated: May 21, 2026</p>

          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a] mb-4">
              <Eye className="h-5 w-5 text-teal-500" />
              1. Information We Collect
            </h2>
            <p className="mb-4">
              StuManage ("we", "our", or "us") collects information necessary to provide our fee
              management service. We collect:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> Your name and email address when you sign up using Google or email/password.</li>
              <li><strong>Student Data:</strong> Names and phone numbers of students you add to manage your library or reading room. You are responsible for collecting appropriate consent from students or guardians before entering this data.</li>
              <li><strong>Payment Data:</strong> Transaction details processed through Razorpay. We do not store your credit card, debit card, or bank account details.</li>
              <li><strong>Usage Data:</strong> Basic app usage logs for debugging and improving the service.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a] mb-4">
              <FileText className="h-5 w-5 text-teal-500" />
              2. How We Use Your Data
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Providing and maintaining the App's features (seat management, fee tracking, reporting).</li>
              <li>Enabling you to send fee reminders via WhatsApp — these are initiated only by you.</li>
              <li>Processing your monthly subscription payment via Razorpay.</li>
              <li>Improving app performance and user experience.</li>
              <li>Sending you important service-related communications (e.g., subscription renewal notices).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a] mb-4">
              <Lock className="h-5 w-5 text-teal-500" />
              3. Data Security
            </h2>
            <p>
              We implement industry-standard security measures including SSL/TLS encryption and Row-Level
              Security (RLS) database policies. Your student records are private to your account and are
              never shared with third parties, except as required to deliver the service (Supabase for
              storage, Razorpay for payments).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">4. Third-Party Services</h2>
            <p className="mb-3">Our App integrates with:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Supabase (supabase.com):</strong> For user authentication and secure database hosting. Supabase is SOC 2 Type 2 compliant.</li>
              <li><strong>Razorpay (razorpay.com):</strong> For secure payment processing. Razorpay is PCI DSS compliant.</li>
              <li><strong>WhatsApp:</strong> Fee reminders open WhatsApp on your device. We do not connect to the WhatsApp API or send messages on your behalf.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">5. Data Retention</h2>
            <p>
              Your data is retained for as long as your account is active. If you delete your account,
              your data will be permanently deleted within 30 days. Student data you delete is removed
              immediately from our active database.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">6. Your Rights (DPDP Act 2023)</h2>
            <p className="mb-3">
              Under India's Digital Personal Data Protection Act, 2023 and other applicable laws, you have
              the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Correct inaccurate personal data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Withdraw consent for data processing (which will result in account termination).</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at <strong className="text-[#0ea495]">support@stumanage.app</strong>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">7. Children's Privacy</h2>
            <p>
              The App is designed for adult operators (18+). Student data entered by operators may include
              minors. Operators are responsible for obtaining consent from parents or guardians for minor
              students as required by applicable law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes
              via in-app notification or email at least 7 days before they take effect.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm">For privacy questions, contact:</p>
            <p className="font-bold text-[#0ea495]">support@stumanage.app</p>
            <p className="text-xs text-slate-400 mt-1">Governing law: India · Jurisdiction: Nagpur, Maharashtra</p>
          </div>
        </div>
      </div>
    </div>
  );
}
