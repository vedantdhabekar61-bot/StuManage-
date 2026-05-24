import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/login" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 active:scale-95 transition-transform"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-black text-slate-900">Terms of Service</h1>
      </div>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-500 text-sm mb-6">Last updated: January 2025</p>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Acceptance of Terms</h2>
        <p className="text-slate-600 mb-4">By using StuManage, you agree to these terms. StuManage provides tools for managing study centers, libraries, and tuition centers.</p>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Free Trial & Subscription</h2>
        <p className="text-slate-600 mb-4">New users receive a 30-day free trial. After the trial, a subscription of ₹50/month is required. You may cancel at any time.</p>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Acceptable Use</h2>
        <p className="text-slate-600 mb-4">You agree to use StuManage only for lawful purposes. You are responsible for maintaining the confidentiality of your account credentials.</p>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Limitation of Liability</h2>
        <p className="text-slate-600">StuManage is provided "as is." We are not liable for any loss of data or business interruption arising from use of this service.</p>
      </div>
    </main>
  );
}
