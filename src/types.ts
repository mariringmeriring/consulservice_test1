export type ConsultationCategory = 
  | '일반 문의'
  | '서비스 안내'
  | '비용 및 견적'
  | '기술 지원'
  | '기타 요청';

export type ConsultationStatus = 'pending' | 'in_progress' | 'completed';

export interface ConsultationItem {
  id: string;
  title: string;
  content: string;
  clientName: string;
  contact: string;
  category: ConsultationCategory;
  status: ConsultationStatus;
  createdAt: string; // ISO string format
  reply?: string;
  repliedAt?: string;
  isUrgent?: boolean;
}

export interface ConsultationFormData {
  title: string;
  content: string;
  clientName: string;
  contact: string;
  category: ConsultationCategory;
  isUrgent: boolean;
}

export interface User {
  id?: string;
  username: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export type AuthMode = 'login' | 'signup';

