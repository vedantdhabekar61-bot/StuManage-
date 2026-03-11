'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  MessageSquare, 
  Bell, 
  Library, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '@/hooks/use-settings';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    libraryName: settings.libraryName || '',
    totalSeats: settings.totalSeats || 50,
    messageTemplate: settings.messageTemplate || '',
    reminderTiming: {
      twoDaysBefore: settings.reminderTiming?.twoDaysBefore ?? true,
      onDueDate: settings.reminderTiming?.onDueDate ?? true,
      threeDaysAfter: settings.reminderTiming?.threeDaysAfter ?? true,
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    await updateSettings(formData);
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Settings</h1>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </button>
        </div>
      </header>

      <div className="p-6 flex flex-col gap-8 max-w-md mx-auto">
        {/* Library Profile */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <Library className="h-4 w-4 text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Library Profile</h2>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Library / Teacher Name</label>
              <input 
                type="text"
                value={formData.libraryName}
                onChange={(e) => setFormData({ ...formData, libraryName: e.target.value })}
                placeholder="e.g. Saraswati Library"
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 px-4 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Total Seats</label>
              <input 
                type="number"
                value={formData.totalSeats}
                onChange={(e) => setFormData({ ...formData, totalSeats: parseInt(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 px-4 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Reminder Settings */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <Bell className="h-4 w-4 text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Reminder Timing</h2>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            {[
              { id: 'twoDaysBefore', label: '2 Days Before Due Date', key: 'twoDaysBefore' },
              { id: 'onDueDate', label: 'On Due Date', key: 'onDueDate' },
              { id: 'threeDaysAfter', label: '3 Days After (If Unpaid)', key: 'threeDaysAfter' }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <button 
                  onClick={() => setFormData({
                    ...formData,
                    reminderTiming: {
                      ...formData.reminderTiming,
                      [item.key]: !formData.reminderTiming[item.key as keyof typeof formData.reminderTiming]
                    }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    formData.reminderTiming[item.key as keyof typeof formData.reminderTiming] ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.reminderTiming[item.key as keyof typeof formData.reminderTiming] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Message Template */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <MessageSquare className="h-4 w-4 text-indigo-600" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">WhatsApp Template</h2>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Message Text</label>
              <textarea 
                rows={8}
                value={formData.messageTemplate}
                onChange={(e) => setFormData({ ...formData, messageTemplate: e.target.value })}
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 px-4 text-sm focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[10px] text-amber-700 border border-amber-100">
              <Info className="h-4 w-4 shrink-0" />
              <p>
                Use tags like <span className="font-bold">[Amount]</span>, <span className="font-bold">[Student Name]</span>, <span className="font-bold">[Due Date]</span>, and <span className="font-bold">[Library Name]</span> to personalize the message.
              </p>
            </div>
          </div>
        </section>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-white shadow-xl"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-bold">Settings Saved!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
