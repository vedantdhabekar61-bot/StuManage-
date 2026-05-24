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
    '[Due Date]': student.expiryDate ? new Date(student.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }) : '',
    '[Library Name]': libraryName || 'the Library',
    '[Teacher / Library Name]': libraryName || 'the Library'
  };

  Object.entries(replacements).forEach(([tag, value]) => {
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    msg = msg.replace(new RegExp(escapedTag, 'g'), value);
  });

  return encodeURIComponent(msg);
}

function getWhatsAppUrl(student: Student, message: string): string {
  if (!student.phoneNumber) return '#';
  const cleanPhone = student.phoneNumber.replace(/\D/g, '');
  const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${phone}?text=${message}`;
}

export function isStudentOverdue(student: Student): boolean {
  if (!student.expiryDate) return false;
  const expiry = new Date(student.expiryDate);
  if (isNaN(expiry.getTime())) return false;
  const now = new Date();
  expiry.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  if (expiry < now) return true;
  if (student.paymentStatus === 'Overdue') return true;
  return false;
}

export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleanPhone);
}

export function openWhatsApp(student: Student, message: string): boolean {
  const url = getWhatsAppUrl(student, message);
  if (url !== '#') {
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      return false;
    }
    return true;
  }
  return false;
}
