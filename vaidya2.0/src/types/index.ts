export type Language = 'en' | 'hi';

export type UrgencyLevel = 'routine' | 'urgent' | 'emergency';

export interface Department {
  id: string;
  nameEn: string;
  nameHi: string;
  iconName: string;
  descriptionEn: string;
  descriptionHi: string;
  roomBlockHintEn: string;
  roomBlockHintHi: string;
  commonSymptomsEn: string[];
  commonSymptomsHi: string[];
}

export interface Doctor {
  id: string;
  hospitalId: string;
  nameEn: string;
  nameHi: string;
  departmentId: string;
  specialtyEn: string;
  specialtyHi: string;
  qualification: string;
  experienceYears: number;
  roomNumber: string;
  floor: string;
  block: string;
  timingsEn: string;
  timingsHi: string;
  availableDays: string[];
  slots: string[];
  consultationFee: number;
  rating: number;
  reviewCount: number;
  avatar: string;
  isAvailableToday: boolean;
  status: 'available' | 'in_opd' | 'on_break' | 'emergency';
}

export interface Hospital {
  id: string;
  nameEn: string;
  nameHi: string;
  city: string;
  areaEn: string;
  areaHi: string;
  addressEn: string;
  addressHi: string;
  distanceKm: number;
  phone: string;
  helpline: string;
  emergency24x7: boolean;
  departments: string[];
  totalBeds: number;
  rating: number;
  lat: number;
  lng: number;
}

export interface Appointment {
  id: string;
  tokenNumber: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  hospitalId: string;
  hospitalNameEn: string;
  hospitalNameHi: string;
  hospitalAddress: string;
  doctorId: string;
  doctorNameEn: string;
  doctorNameHi: string;
  doctorSpecialtyEn: string;
  doctorSpecialtyHi: string;
  departmentId: string;
  departmentNameEn: string;
  departmentNameHi: string;
  roomNumber: string;
  floor: string;
  block: string;
  appointmentDate: string;
  timeSlot: string;
  qrCodeDataUrl?: string;
  status: 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  bookedAt: string;
  bookingSource: 'chat' | 'helpline' | 'web';
  symptomSummary?: string;
}

export interface TriageResult {
  departmentId: string;
  departmentNameEn: string;
  departmentNameHi: string;
  doctorTypeEn: string;
  doctorTypeHi: string;
  urgency: UrgencyLevel;
  confidence: number;
  rationaleEn: string;
  rationaleHi: string;
  isEmergency: boolean;
  emergencyInstructionsEn?: string;
  emergencyInstructionsHi?: string;
  preparationTipsEn: string[];
  preparationTipsHi: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'akesa' | 'system';
  textEn: string;
  textHi: string;
  timestamp: string;
  triageResult?: TriageResult;
  suggestedHospitals?: Hospital[];
  suggestedDoctors?: Doctor[];
  appointment?: Appointment;
  interactiveType?: 'quick_replies' | 'hospital_list' | 'doctor_list' | 'slot_picker' | 'pass_view';
  quickReplies?: { textEn: string; textHi: string; actionValue: string }[];
}

export type ViewTab = 'chat' | 'helpline' | 'hospitals' | 'admin';
