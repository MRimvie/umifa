import { PrismaClient, UserRole, SchoolYearStatus, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@umifa.fr' },
    update: {},
    create: {
      email: 'admin@umifa.fr',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'UMIFA',
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log('✅ Super Admin créé:', superAdmin.email);

  const school1 = await prisma.school.upsert({
    where: { name: 'Medersa Al-Ihsan' },
    update: {},
    create: {
      name: 'Medersa Al-Ihsan',
      address: '123 Rue de la Paix, Paris',
      phone: '01 23 45 67 89',
      email: 'contact@alihsan.fr',
      contactName: 'Directeur Al-Ihsan',
    },
  });

  const school2 = await prisma.school.upsert({
    where: { name: 'Medersa An-Nour' },
    update: {},
    create: {
      name: 'Medersa An-Nour',
      address: '456 Avenue des Lumières, Lyon',
      phone: '04 56 78 90 12',
      email: 'contact@annour.fr',
      contactName: 'Directeur An-Nour',
    },
  });

  console.log('✅ Écoles créées:', school1.name, school2.name);

  const schoolYear = await prisma.schoolYear.upsert({
    where: { year: '2025-2026' },
    update: {},
    create: {
      year: '2025-2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-06-30'),
      status: SchoolYearStatus.INSCRIPTION,
      isActive: true,
    },
  });

  console.log('✅ Année scolaire créée:', schoolYear.year);

  const center1 = await prisma.examCenter.create({
    data: {
      name: 'Centre Paris Nord',
      address: '789 Boulevard du Nord, Paris',
      capacity: 100,
      phone: '01 98 76 54 32',
    },
  });

  const center2 = await prisma.examCenter.create({
    data: {
      name: 'Centre Lyon Sud',
      address: '321 Rue du Sud, Lyon',
      capacity: 80,
      phone: '04 12 34 56 78',
    },
  });

  console.log('✅ Centres d\'examen créés:', center1.name, center2.name);

  const schoolManager = await prisma.user.create({
    data: {
      email: 'manager@alihsan.fr',
      password: hashedPassword,
      firstName: 'Responsable',
      lastName: 'Al-Ihsan',
      role: UserRole.SCHOOL_MANAGER,
      schoolId: school1.id,
    },
  });

  console.log('✅ Responsable d\'école créé:', schoolManager.email);

  const grader = await prisma.user.create({
    data: {
      email: 'grader@umifa.fr',
      password: hashedPassword,
      firstName: 'Correcteur',
      lastName: 'Paris',
      role: UserRole.GRADER,
      centerId: center1.id,
    },
  });

  console.log('✅ Correcteur créé:', grader.email);

  const candidate1 = await prisma.candidate.create({
    data: {
      firstName: 'Ahmed',
      lastName: 'Benali',
      gender: Gender.MASCULIN,
      dateOfBirth: new Date('2010-05-15'),
      placeOfBirth: 'Paris',
      nationality: 'Française',
      schoolId: school1.id,
      schoolYearId: schoolYear.id,
    },
  });

  const candidate2 = await prisma.candidate.create({
    data: {
      firstName: 'Fatima',
      lastName: 'Zahra',
      gender: Gender.FEMININ,
      dateOfBirth: new Date('2010-08-22'),
      placeOfBirth: 'Lyon',
      nationality: 'Française',
      schoolId: school2.id,
      schoolYearId: schoolYear.id,
    },
  });

  console.log('✅ Candidats créés:', candidate1.firstName, candidate2.firstName);

  console.log('\n🎉 Seeding terminé avec succès!');
  console.log('\n📝 Comptes de test créés:');
  console.log('   Super Admin: admin@umifa.fr / admin123');
  console.log('   Responsable école: manager@alihsan.fr / admin123');
  console.log('   Correcteur: grader@umifa.fr / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
