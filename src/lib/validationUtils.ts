const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

export type CorrectionField = 'name' | 'email' | 'phone';

interface CandidateDetails {
  name: string | null;
  email: string | null;
  phone: string | null;
}

interface ValidationResult {
  isValid: boolean;
  fieldsToCorrect: CorrectionField[];
}
export const validateAndGetCorrections = (details: CandidateDetails): ValidationResult => {
  const fieldsToCorrect: CorrectionField[] = [];
  if (!details.name) {
    fieldsToCorrect.push('name');
  }
  if (!details.email || !emailRegex.test(details.email)) {
    fieldsToCorrect.push('email');
  }


  const sanitizedPhone = details.phone?.replace(/[\s-()+]/g, '') || '';
  if (!phoneRegex.test(sanitizedPhone.slice(-10))) {
    fieldsToCorrect.push('phone');
  }

  return {
    isValid: fieldsToCorrect.length === 0,
    fieldsToCorrect,
  };
};

