/**
 * Exemples de données pour la documentation Swagger
 */

export const SwaggerExamples = {
  // Authentification
  auth: {
    login: {
      superAdmin: {
        email: 'admin@umifa.fr',
        password: 'admin123'
      },
      schoolManager: {
        email: 'manager@alihsan.fr',
        password: 'admin123'
      },
      grader: {
        email: 'grader@umifa.fr',
        password: 'admin123'
      }
    },
    loginResponse: {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHVtaWZhLmZyIiwic3ViIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwicm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzA5NDAwMDAwLCJleHAiOjE3MTAwMDQ4MDB9.example',
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@umifa.fr',
        firstName: 'Admin',
        lastName: 'UMIFA',
        role: 'SUPER_ADMIN'
      }
    }
  },

  // Écoles
  schools: {
    create: {
      name: 'Medersa Al-Ihsan',
      address: '123 Rue de la Paix, Paris 75001',
      phone: '01 23 45 67 89',
      email: 'contact@alihsan.fr',
      contactName: 'Directeur Al-Ihsan'
    },
    response: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Medersa Al-Ihsan',
      address: '123 Rue de la Paix, Paris 75001',
      phone: '01 23 45 67 89',
      email: 'contact@alihsan.fr',
      contactName: 'Directeur Al-Ihsan',
      isActive: true,
      createdAt: '2026-03-02T19:00:00.000Z',
      updatedAt: '2026-03-02T19:00:00.000Z'
    }
  },

  // Années scolaires
  schoolYears: {
    create: {
      year: '2025-2026',
      startDate: '2025-09-01',
      endDate: '2026-06-30',
      status: 'INSCRIPTION'
    },
    response: {
      id: '660e8400-e29b-41d4-a716-446655440001',
      year: '2025-2026',
      startDate: '2025-09-01T00:00:00.000Z',
      endDate: '2026-06-30T00:00:00.000Z',
      status: 'INSCRIPTION',
      isActive: true,
      createdAt: '2026-03-02T19:00:00.000Z',
      updatedAt: '2026-03-02T19:00:00.000Z'
    }
  },

  // Centres d'examen
  examCenters: {
    create: {
      name: 'Centre Paris Nord',
      address: '789 Boulevard du Nord, Paris 75018',
      capacity: 100,
      phone: '01 98 76 54 32'
    },
    response: {
      id: '880e8400-e29b-41d4-a716-446655440003',
      name: 'Centre Paris Nord',
      address: '789 Boulevard du Nord, Paris 75018',
      capacity: 100,
      phone: '01 98 76 54 32',
      isActive: true,
      createdAt: '2026-03-02T19:00:00.000Z',
      updatedAt: '2026-03-02T19:00:00.000Z'
    }
  },

  // Candidats
  candidates: {
    create: {
      firstName: 'Ahmed',
      lastName: 'Benali',
      gender: 'MASCULIN',
      dateOfBirth: '2010-05-15',
      placeOfBirth: 'Paris',
      nationality: 'Française',
      schoolId: '550e8400-e29b-41d4-a716-446655440000',
      schoolYearId: '660e8400-e29b-41d4-a716-446655440001'
    },
    createFemale: {
      firstName: 'Fatima',
      lastName: 'Zahra',
      gender: 'FEMININ',
      dateOfBirth: '2010-08-22',
      placeOfBirth: 'Lyon',
      nationality: 'Française',
      schoolId: '550e8400-e29b-41d4-a716-446655440000',
      schoolYearId: '660e8400-e29b-41d4-a716-446655440001'
    },
    response: {
      id: '770e8400-e29b-41d4-a716-446655440002',
      firstName: 'Ahmed',
      lastName: 'Benali',
      gender: 'MASCULIN',
      dateOfBirth: '2010-05-15T00:00:00.000Z',
      placeOfBirth: 'Paris',
      nationality: 'Française',
      numeroPV: '2026001',
      schoolId: '550e8400-e29b-41d4-a716-446655440000',
      schoolYearId: '660e8400-e29b-41d4-a716-446655440001',
      centerId: '880e8400-e29b-41d4-a716-446655440003',
      school: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Medersa Al-Ihsan'
      },
      schoolYear: {
        id: '660e8400-e29b-41d4-a716-446655440001',
        year: '2025-2026'
      },
      center: {
        id: '880e8400-e29b-41d4-a716-446655440003',
        name: 'Centre Paris Nord'
      },
      createdAt: '2026-03-02T19:00:00.000Z',
      updatedAt: '2026-03-02T19:00:00.000Z'
    },
    assignCenter: {
      candidateIds: [
        '770e8400-e29b-41d4-a716-446655440002',
        '770e8400-e29b-41d4-a716-446655440003'
      ],
      centerId: '880e8400-e29b-41d4-a716-446655440003'
    }
  },

  // Notes
  grades: {
    create: {
      candidateId: '770e8400-e29b-41d4-a716-446655440002',
      subject: 'Langue Arabe',
      score: 15.5
    },
    createMultiple: [
      {
        candidateId: '770e8400-e29b-41d4-a716-446655440002',
        subject: 'Langue Arabe',
        score: 15.5
      },
      {
        candidateId: '770e8400-e29b-41d4-a716-446655440002',
        subject: 'Sciences Islamiques',
        score: 16
      },
      {
        candidateId: '770e8400-e29b-41d4-a716-446655440002',
        subject: 'Mathématiques',
        score: 14
      }
    ],
    response: {
      id: '990e8400-e29b-41d4-a716-446655440004',
      candidateId: '770e8400-e29b-41d4-a716-446655440002',
      centerId: '880e8400-e29b-41d4-a716-446655440003',
      subject: 'Langue Arabe',
      score: 15.5,
      totalScore: 45.5,
      average: 15.17,
      result: 'ADMIS',
      createdAt: '2026-03-02T19:00:00.000Z',
      updatedAt: '2026-03-02T19:00:00.000Z'
    },
    calculateResult: {
      candidateId: '770e8400-e29b-41d4-a716-446655440002',
      totalScore: 45.5,
      average: 15.17,
      result: 'ADMIS',
      gradesCount: 3
    }
  },

  // Utilisateurs
  users: {
    create: {
      email: 'nouveau.user@umifa.fr',
      password: 'password123',
      firstName: 'Nouveau',
      lastName: 'Utilisateur',
      role: 'SCHOOL_MANAGER',
      schoolId: '550e8400-e29b-41d4-a716-446655440000'
    },
    createGrader: {
      email: 'correcteur@umifa.fr',
      password: 'password123',
      firstName: 'Correcteur',
      lastName: 'Centre',
      role: 'GRADER',
      centerId: '880e8400-e29b-41d4-a716-446655440003'
    },
    response: {
      id: 'aa0e8400-e29b-41d4-a716-446655440005',
      email: 'nouveau.user@umifa.fr',
      firstName: 'Nouveau',
      lastName: 'Utilisateur',
      role: 'SCHOOL_MANAGER',
      isActive: true,
      schoolId: '550e8400-e29b-41d4-a716-446655440000',
      centerId: null,
      createdAt: '2026-03-02T19:00:00.000Z'
    }
  }
};
