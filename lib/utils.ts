import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Student } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const toLocalDateString = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

export function formatWhatsAppMessage(template: string, student: Student, libraryName: string): string {
  if (!template) return '';
  let msg = template;
  
  const replacements: Record<string, string> = {
    '[Amount]': (student.price || 0).toString(),
    '[Student Name]': student.studentName || '',
    '[Due Date]': student.expiryDate 
      ? new Date(student.expiryDate + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }) 
      : '',
    '[Teacher / Library Name]': libraryName || 'the Library',
  };

  Object.entries(replacements).forEach(([tag, value]) => {
    // Escape brackets for regex
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    msg = msg.replace(new RegExp(escapedTag, 'g'), value);
  });

  return encodeURIComponent(msg);
}

function getWhatsAppUrl(student: Student, message: string): string {
  if (!student.phoneNumber) return '#';
  // Remove all non-numeric characters from phone
  const cleanPhone = student.phoneNumber.replace(/\D/g, '');
  // Ensure it has 91 prefix if it's a 10-digit number
  const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  
  if (typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return `whatsapp://send?phone=${phone}&text=${message}`;
  }
  return `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;
}

export function isStudentOverdue(student: Student): boolean {
  if (!student.expiryDate) return false;
  
  const expiry = new Date(student.expiryDate);
  if (isNaN(expiry.getTime())) return false;
  
  const now = new Date();
  
  // Reset time to start of day for accurate comparison
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  
  // Overdue if the date has strictly passed (is before today)
  if (expiry < now) return true;
  
  // If expiry hasn't passed, check if they are marked as Overdue manually (though usually it's based on date)
  if (student.paymentStatus === 'Overdue') return true;

  return false;
}

export function isValidPhone(phone: string): boolean {
  // Removes non-numeric for validation check
  const cleanPhone = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleanPhone);
}

export function openWhatsApp(student: Student, message: string): boolean {
  const url = getWhatsAppUrl(student, message);
  if (url !== '#') {
    if (url.startsWith('whatsapp://')) {
      window.location.href = url;
      return true;
    }
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      return false;
    }
    return true;
  }
  return false;
}
