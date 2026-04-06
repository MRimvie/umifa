export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  gender: 'MASCULIN' | 'FEMININ';
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  numeroPV?: string;
  schoolId: string;
  schoolYearId: string;
  centerId?: string;
  school?: {
    id: string;
    name: string;
  };
  schoolYear?: {
    id: string;
    year: string;
  };
  center?: {
    id: string;
    name: string;
  };
  grades?: Grade[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Grade {
  id: string;
  candidateId: string;
  centerId: string;
  subject: string;
  score: number;
  totalScore?: number;
  average?: number;
  result?: 'ADMIS' | 'AJOURNE' | 'EN_ATTENTE';
  createdAt?: string;
  updatedAt?: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  contactName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  status: 'INSCRIPTION' | 'REPARTITION' | 'EXAMEN' | 'CLOTURE';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamCenter {
  id: string;
  name: string;
  address: string;
  capacity: number;
  phone: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
