export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const Validators = {
  isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  isValidPassword(password: string): boolean {
    return password.length >= 8;
  },

  isValidLatitude(lat: number): boolean {
    return lat >= -90 && lat <= 90;
  },

  isValidLongitude(lon: number): boolean {
    return lon >= -180 && lon <= 180;
  },
};
