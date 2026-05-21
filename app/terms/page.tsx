'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Scale, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 pb-24">
      <header className="mb-8 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#5F5243] shadow-soft transition-all active:scale-95"
          id="btn-back-terms"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-[#1a1a1a]">Terms & Conditions</h1>
      </header>

      <div className="mx-auto max-w-2xl bg-white rounded-[2rem] p-8 shadow-soft border border-black/5">
        <div className="flex items-center gap-3 mb-6 text-[#0ea495]">
          <Scale className="h-6 w-6" />
          <span className="font-bold text-sm uppercase tracking-widest">Legal Agreement</span>
        </div>

        <div className="prose prose-slate max-w-none text-[#5F5243]">
          <p className="text-sm italic mb-8">Last Updated: May 21, 2026</p>

          <p className="mb-6">
            Welcome to StuManage. By accessing or using our application, websites, or services (collectively, the "Services"), you agree to be bound by these Terms and Conditions ("Terms"). Please read them carefully.
          </p>

          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a] mb-4">
              <CheckCircle className="h-5 w-5 text-teal-500" />
              1. Acceptance of Terms
            </h2>
            <p className="mb-4">
              By registering for an account or using any part of StuManage, you acknowledge that you have read, understood, and agree to be bound by these Terms, as well as our Privacy Policy. If you do not agree to these Terms, you must not use our Services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a] mb-4">
              <FileText className="h-5 w-5 text-teal-500" />
              2. Use of the Services
            </h2>
            <p className="mb-4">
              StuManage provides management utilities designed for tuition centers, coaching institutes, and reading rooms.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account Security:</strong> You are responsible for safeguarding your password and maintaining accurate account details. You agree to notify us immediately of any unauthorized use of your account.</li>
              <li><strong>Student Consent:</strong> You represent and warrant that you have obtained all necessary permissions, consents, and authorizations from your students (or their legal guardians) before entering their names, phone numbers, or academic data into our system.</li>
              <li><strong>Communication Conduct:</strong> Fee alerts sent via WhatsApp are initiated and triggered by you. You must not use our notification shortcuts to spam, harass, or broadcast promotional messages in violation of spam-protection or messaging provider terms.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a] mb-4">
              <Scale className="h-5 w-5 text-teal-500" />
              3. Payments, Billing, and Refunds
            </h2>
            <p className="mb-4">
              Certain features of the app are paid Pro features. Payment collection and billing are managed under the following terms:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Payment Processing:</strong> All transactions and Pro subscriptions are securely processed through our integrated payment gateway partner, <strong>Razorpay</strong>.</li>
              <li><strong>Fees:</strong> Subscription fees are charged in advance on a recurring monthly or annual basis and are non-refundable once billed, unless strictly required under regional regulatory guidelines.</li>
              <li><strong>Cancellation:</strong> You can cancel your subscription at any time. Upon cancellation, you will retain access to Pro features until the end of your current active billing cycle.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[#1a1a1a] mb-4">
              <AlertCircle className="h-5 w-5 text-teal-500" />
              4. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, StuManage and its affiliates, officers, or developers shall not be liable for any indirect, incidental, special, exemplary, or pure economic loss resulting from your use of, or inability to use, our Services. The Services are provided on an "as is" and "as available" basis without warranties of any kind.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">5. Modifications to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will post notice of updates within the app. Your continued use of the platform after updates are made constitutes acceptance of the new Terms.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm">For official legal inquiries or support, please reach out to:</p>
            <p className="font-bold text-[#0ea495] mt-1">legal@stumanage.app</p>
          </div>
        </div>
      </div>
    </div>
  );
}
