/**
 * Normalizes and formats Indian phone numbers with the +91 international dialing code.
 *
 * Rules:
 * - 10-digit Indian mobile number (starting with 6, 7, 8, 9): formats with "+91 " (e.g., 8100278890 -> +91 81002 78890)
 * - 11 digits starting with 0: strips leading 0 and prefixes "+91 "
 * - 12 digits starting with 91: prefixes "+91 "
 * - Existing "+91" prefix: cleaned and preserved
 * - Foreign numbers (starting with other "+"): preserved as is
 */

export function formatIndianPhoneNumber(phone: string | undefined | null): string {
  if (!phone) return '';
  const trimmed = phone.trim();
  if (!trimmed) return '';

  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  // 1. 10 digits starting with Indian mobile prefixes (6, 7, 8, 9)
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  // 2. 11 digits starting with 0 (STD / Trunk prefix) followed by 6-9
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
    const mainDigits = digits.slice(1);
    return `+91 ${mainDigits.slice(0, 5)} ${mainDigits.slice(5)}`;
  }

  // 3. 12 digits starting with 91 followed by 6-9
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) {
    const mainDigits = digits.slice(2);
    return `+91 ${mainDigits.slice(0, 5)} ${mainDigits.slice(5)}`;
  }

  // 4. Any 10-digit number without a leading plus in this app context
  if (digits.length === 10 && !hasPlus) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }

  // 5. If already has +91 without spaces: "+918100278890" -> "+91 81002 78890"
  if (hasPlus && trimmed.startsWith('+91') && digits.length === 12) {
    const mainDigits = digits.slice(2);
    return `+91 ${mainDigits.slice(0, 5)} ${mainDigits.slice(5)}`;
  }

  return trimmed;
}

/**
 * Returns an E.164 dialable telephone string suitable for `tel:` and `sms:` deep links.
 * E.g., "+91 81002 78890" -> "+918100278890"
 */
export function toDialablePhone(phone: string | undefined | null): string {
  if (!phone) return '';
  const formatted = formatIndianPhoneNumber(phone);
  return formatted.replace(/[^\d+]/g, '');
}
