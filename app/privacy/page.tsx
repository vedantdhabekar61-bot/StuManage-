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
          <p className="text-sm italic mb-8">Last Updated: May 19, 2026</p>

          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a] mb-4">
              <Eye className="h-5 w-5 text-teal-500" />
              1. Information We Collect
            </h2>
            <p className="mb-4">
              StuManage ("we", "our", or "us") collects information to provide better services to our users. We collect:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Information:</strong> Your name and email address when you sign up using Google Auth or email.</li>
              <li><strong>Student Data:</strong> Information you provide about your students, including names, phone numbers, and payment status, to help you manage your library or reading room.</li>
              <li><strong>Payment Data:</strong> Transaction details processed through Razorpay. We do not store your credit card or bank details on our servers.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a] mb-4">
              <FileText className="h-5 w-5 text-teal-500" />
              2. How We Use Data
            </h2>
            <p className="mb-4">We use the collected information for:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Providing and maintaining the App features.</li>
              <li>Sending automated fee reminders via WhatsApp (initiated by you).</li>
              <li>Processing your Pro subscription payments.</li>
              <li>Improving app performance and user experience.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a] mb-4">
              <Lock className="h-5 w-5 text-teal-500" />
              3. Data Security
            </h2>
            <p>
              We implement industry-standard security measures including SSL encryption and secure database rules to protect your data. Your student records are private to your account and are never shared with third parties, except as required for service delivery (e.g., payment processing via Razorpay).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">4. Third-Party Services</h2>
            <p>
              Our app integrates with:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Google Firebase:</strong> For authentication and database hosting.</li>
              <li><strong>Razorpay:</strong> For secure payment gateway services.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">5. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time through the App settings. For account deletion requests, please contact our support.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm">For questions regarding this policy, contact:</p>
            <p className="font-bold text-[#0ea495]">support@stumanage.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}
