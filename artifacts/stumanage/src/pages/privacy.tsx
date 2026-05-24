import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 max-w-lg mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/login" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 active:scale-95 transition-transform"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-black text-slate-900">Privacy Policy</h1>
      </div>
      <div className="prose prose-slate max-w-none">
        <p className="text-slate-500 text-sm mb-6">Last updated: January 2025</p>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Data We Collect</h2>
        <p className="text-slate-600 mb-4">We collect only the data necessary to provide the StuManage service: your email address, name, and the student records you create. All data is stored securely in our database.</p>
        <h2 className="text-lg font-bold text-slate-800 mb-3">How We Use Your Data</h2>
        <p className="text-slate-600 mb-4">Your data is used solely to provide you access to the app and manage your students. We do not sell or share your data with third parties.</p>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Data Security</h2>
        <p className="text-slate-600 mb-4">We use Supabase for authentication and data storage, which provides enterprise-grade security including row-level security policies ensuring only you can access your data.</p>
        <h2 className="text-lg font-bold text-slate-800 mb-3">Contact</h2>
        <p className="text-slate-600">For any privacy concerns, please contact us through the app.</p>
      </div>
    </main>
  );
}
