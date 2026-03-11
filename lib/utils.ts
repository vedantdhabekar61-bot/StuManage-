import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Student } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWhatsAppMessage(template: string, student: Student, libraryName: string): string {
  if (!template) return '';
  let msg = template;
  
  const replacements: Record<string, string> = {
    '[Amount]': (student.price || 0).toString(),
    '[Student Name]': student.name || '',
    '[Due Date]': student.expiryDate ? new Date(student.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' }) : '',
    '[Library Name]': libraryName || 'the Library',
    '[Teacher / Library Name]': libraryName || 'the Library'
  };

  Object.entries(replacements).forEach(([tag, value]) => {
    // Escape brackets for regex
    const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    msg = msg.replace(new RegExp(escapedTag, 'g'), value);
  });

  return encodeURIComponent(msg);
}

export function getWhatsAppUrl(student: Student, message: string): string {
  if (!student.phone) return '#';
  // Remove all non-numeric characters from phone
  const cleanPhone = student.phone.replace(/\D/g, '');
  // Ensure it has 91 prefix if it's a 10-digit number
  const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${phone}?text=${message}`;
}

export function openWhatsApp(student: Student, message: string) {
  const url = getWhatsAppUrl(student, message);
  if (url !== '#') {
    window.open(url, '_blank');
  }
}
