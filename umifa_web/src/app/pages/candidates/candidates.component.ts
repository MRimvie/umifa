import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CandidateService } from '../../core/services/candidate.service';
import { SchoolService } from '../../core/services/school.service';
import { SchoolYearService, SchoolYear } from '../../core/services/school-year.service';
import { Candidate, School } from '../../core/models/candidate.model';
import { ExamCenterService, ExamCenter } from '../../core/services/exam-center.service';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { MobileListComponent } from '../../shared/components/mobile-list/mobile-list.component';
import { BottomSheetComponent } from '../../shared/components/bottom-sheet/bottom-sheet.component';
import { TranslateModule } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface CandidateFormData {
  firstName: string;
  lastName: string;
  gender: 'MASCULIN' | 'FEMININ';
  dateOfBirth: string;
  placeOfBirth: string;
  nationality: string;
  schoolId: string;
  schoolYearId: string;
}

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, MobileListComponent, BottomSheetComponent, TranslateModule],
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.scss']
})
export class CandidatesComponent implements OnInit {
  private candidateService = inject(CandidateService);
  private schoolService = inject(SchoolService);
  private schoolYearService = inject(SchoolYearService);
  private examCenterService = inject(ExamCenterService);
  private sanitizer = inject(DomSanitizer);
  
  candidates = signal<Candidate[]>([]);
  schools = signal<School[]>([]);
  schoolYears = signal<SchoolYear[]>([]);
  activeSchoolYear = signal<SchoolYear | null>(null);
  centers = signal<ExamCenter[]>([]);
  loading = signal(false);
  showDrawer = signal(false);
  editMode = signal(false);
  selectedCandidate = signal<Candidate | null>(null);

  selectedSchoolYearIdFilter = signal<string>('');
  selectedCenterIdFilter = signal<string>('');
  selectedSchoolIdFilter = signal<string>('');

  pageIndex = signal(0);
  pageSize = signal(10);

  mobileSheetOpen = signal(false);
  mobileSelectedCandidate = signal<Candidate | null>(null);

  pdfPreviewOpen = signal(false);
  pdfPreviewSafeUrl = signal<SafeResourceUrl | null>(null);
  pdfFileName = signal<string>('');
  private _pdfBlobUrl = '';

  dialogOpen = signal(false);
  dialogTitle = signal('');
  dialogMessage = signal('');
  dialogVariant = signal<'info' | 'success' | 'error' | 'confirm'>('info');
  dialogItems = signal<string[]>([]);
  private dialogConfirmAction: (() => void) | null = null;

  openMobileDetails(candidate: Candidate): void {
    this.mobileSelectedCandidate.set(candidate);
    this.mobileSheetOpen.set(true);
  }

  closeMobileDetails(): void {
    this.mobileSheetOpen.set(false);
  }
  
  formData = signal<CandidateFormData>({
    firstName: '',
    lastName: '',
    gender: 'MASCULIN',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'Burkinabé',
    schoolId: '',
    schoolYearId: ''
  });

  ngOnInit(): void {
    this.loadCandidates();
    this.loadSchools();
    this.loadSchoolYears();
    this.loadActiveSchoolYear();
    this.loadCenters();
  }

  private openDialog(params: {
    title: string;
    message: string;
    variant: 'info' | 'success' | 'error' | 'confirm';
    items?: string[];
    onConfirm?: () => void;
  }): void {
    this.dialogTitle.set(params.title);
    this.dialogMessage.set(params.message);
    this.dialogVariant.set(params.variant);
    this.dialogItems.set(params.items ?? []);
    this.dialogConfirmAction = params.onConfirm ?? null;
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.dialogConfirmAction = null;
  }

  confirmDialog(): void {
    const action = this.dialogConfirmAction;
    this.closeDialog();
    action?.();
  }

  loadCandidates(): void {
    this.loading.set(true);
    const filters = {
      schoolYearId: this.selectedSchoolYearIdFilter() || undefined,
      centerId: this.selectedCenterIdFilter() || undefined,
      schoolId: this.selectedSchoolIdFilter() || undefined,
    };

    this.candidateService.getAll(filters).subscribe({
      next: (data) => {
        this.candidates.set(data);
        this.pageIndex.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur chargement candidats', err);
        this.loading.set(false);
      }
    });
  }

  loadSchools(): void {
    this.schoolService.getAll().subscribe({
      next: (data) => this.schools.set(data),
      error: (err) => console.error('Erreur chargement écoles', err)
    });
  }

  loadSchoolYears(): void {
    this.schoolYearService.getAll().subscribe({
      next: (data) => this.schoolYears.set(data),
      error: (err) => console.error('Erreur chargement années', err)
    });
  }

  loadActiveSchoolYear(): void {
    this.schoolYearService.getActive().subscribe({
      next: (data) => this.activeSchoolYear.set(data),
      error: (err) => {
        console.error('Erreur chargement année active', err);
        this.activeSchoolYear.set(null);
      }
    });
  }

  loadCenters(): void {
    this.examCenterService.getAll().subscribe({
      next: (data) => this.centers.set(data),
      error: (err) => console.error('Erreur chargement centres', err),
    });
  }

  onChangeFilters(): void {
    this.loadCandidates();
  }

  private selectedCenterName(): string {
    const id = this.selectedCenterIdFilter();
    if (!id) return '';
    return this.centers().find((c) => c.id === id)?.name || '';
  }

  private selectedSchoolName(): string {
    const id = this.selectedSchoolIdFilter();
    if (!id) return '';
    return this.schools().find((s) => s.id === id)?.name || '';
  }

  private selectedSchoolYearLabel(): string {
    const id = this.selectedSchoolYearIdFilter();
    if (!id) return this.activeSchoolYear()?.year || '';
    return this.schoolYears().find((y) => y.id === id)?.year || '';
  }

  private exportFileBaseName(): string {
    const parts: string[] = ['liste_candidats'];
    const year = this.selectedSchoolYearLabel();
    const center = this.selectedCenterName();
    const school = this.selectedSchoolName();
    if (year) parts.push(year.replace(/\s+/g, '_'));
    if (center) parts.push(center.replace(/\s+/g, '_'));
    if (school) parts.push(school.replace(/\s+/g, '_'));
    return parts.join('_');
  }

  exportExcel(): void {
    const candidates = [...this.candidates()].sort((a, b) => {
      const av = a.numeroPV || '';
      const bv = b.numeroPV || '';
      return av.localeCompare(bv, 'fr', { numeric: true, sensitivity: 'base' });
    });

    const rows = candidates.map((c) => ({
      NOM: c.lastName || '',
      'PRENOM(S)': c.firstName || '',
      'ANNEE SCOLAIRE': c.schoolYear?.year || '',
      ECOLE: c.school?.name || '',
      CENTRE: c.center?.name || '',
      'N°PV': c.numeroPV || '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidats');
    XLSX.writeFile(wb, `${this.exportFileBaseName()}.xlsx`);
  }

  async exportPdf(): Promise<void> {
    this.loading.set(true);
    try {
      await this._generatePdf();
    } catch (err) {
      console.error('Erreur génération PDF', err);
    } finally {
      this.loading.set(false);
    }
  }

  private async _generatePdf(): Promise<void> {
    const candidates = [...this.candidates()].sort((a, b) => {
      const av = a.numeroPV || '';
      const bv = b.numeroPV || '';
      return av.localeCompare(bv, 'fr', { numeric: true, sensitivity: 'base' });
    });

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Try to load Arabic font; probe with actual text to confirm it works.
    // jsPDF's TTF parser swallows parse errors via PubSub (not catchable),
    // so we must test doc.text() itself which WILL throw if the font is bad.
    let arabicFont = 'helvetica';
    let arabicWorks = false;
    try {
      const response = await fetch('/fonts/amiri-regular.ttf');
      if (response.ok) {
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        doc.addFileToVFS('amiri-regular.ttf', base64);
        doc.addFont('amiri-regular.ttf', 'Amiri', 'normal');
        // Probe: doc.text throws if font was not parsed correctly
        doc.setFont('Amiri', 'normal');
        doc.setFontSize(9);
        doc.text('ا', 0, -100);
        arabicFont = 'Amiri';
        arabicWorks = true;
      }
    } catch (_) { /* font incompatible — French-only PDF */ }

    const centerName = this.selectedCenterName();
    const schoolName = this.selectedSchoolName();
    const yearLabel = this.selectedSchoolYearLabel();

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 14;
    const marginRight = pageWidth - 14;

    let y = 14;

    // Header: French on left, Arabic on right (if font works)
    const headerRows = [
      { fr: 'BURKINA FASO',                    ar: 'بوركينا فاسو' },
      { fr: 'UNION DES MEDERSA ISLAMIQUES',    ar: 'اتحاد المدارس الإسلامية' },
      { fr: 'FRANCO-ARABE (UMIFA)',             ar: 'العربية الفرنسية' },
      { fr: 'SERVICE DES EXAMENS',             ar: 'إدارة الامتحانات' },
    ];

    doc.setFontSize(9);
    for (const row of headerRows) {
      doc.setFont('helvetica', 'normal');
      doc.text(row.fr, marginLeft, y);
      if (arabicWorks) {
        doc.setFont(arabicFont, 'normal');
        doc.text(row.ar, marginRight, y, { align: 'right' });
      }
      y += 5;
    }

    // Separator line
    y += 1;
    doc.setLineWidth(0.3);
    doc.line(marginLeft, y, marginRight, y);
    y += 5;

    // Center name: Arabic above (if available + font works), French below
    if (centerName) {
      const selectedCenter = this.centers().find(c => c.id === this.selectedCenterIdFilter());
      const centerNameAr = selectedCenter?.nameAr || '';
      if (arabicWorks && centerNameAr) {
        doc.setFont(arabicFont, 'normal');
        doc.setFontSize(11);
        doc.text(centerNameAr, pageWidth / 2, y, { align: 'center' });
        y += 6;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`CENTRE ${centerName}`, pageWidth / 2, y, { align: 'center' });
      y += 6;
    }

    // Main title (French)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const titleYear = yearLabel ? ` (SESSION ${yearLabel})` : '';
    doc.text(`LISTE DES CANDIDATS AU CEP FRANCO-ARABE${titleYear}`, pageWidth / 2, y, { align: 'center' });
    y += 6;

    // Arabic subtitle (only if font works)
    if (arabicWorks) {
      doc.setFontSize(10);
      doc.setFont(arabicFont, 'normal');
      const arSubtitle = yearLabel
        ? `أسماء المرشحين في امتحان الشهادة الابتدائية العربية الفرنسية ( دورة ${yearLabel})`
        : 'أسماء المرشحين في امتحان الشهادة الابتدائية العربية الفرنسية';
      doc.text(arSubtitle, pageWidth / 2, y, { align: 'center' });
      y += 5;
    }

    // Optional school filter line
    if (schoolName) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text(`Ecole : ${schoolName}`, marginLeft, y);
      y += 5;
    }

    // Table: bilingual headers if Arabic font works, French-only otherwise
    const head = arabicWorks
      ? [
          ['تسلسل', 'رقم المحضر', 'اللقب', 'الاسم', 'الجنس', 'المدرسة'],
          ['N°', 'N°de PV', 'NOM', 'PRENOM(s)', 'SEXE', 'ECOLE'],
        ]
      : [['N°', 'N°de PV', 'NOM', 'PRENOM(s)', 'SEXE', 'ECOLE']];

    const body = candidates.map((c, idx) => [
      String(idx + 1),
      c.numeroPV || '',
      c.lastName || '',
      c.firstName || '',
      c.gender === 'MASCULIN' ? 'M' : c.gender === 'FEMININ' ? 'F' : '',
      c.school?.name || '',
    ]);

    autoTable(doc, {
      head,
      body,
      startY: y + 2,
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 1.5,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
      },
      ...(arabicWorks && {
        didParseCell: (data: any) => {
          if (data.section === 'head' && data.row.index === 0) {
            data.cell.styles.font = arabicFont;
            data.cell.styles.fontStyle = 'normal';
            data.cell.styles.halign = 'right';
          }
        },
      }),
      theme: 'grid',
      margin: { left: marginLeft, right: 14 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 22, halign: 'center' },
        2: { cellWidth: 32 },
        3: { cellWidth: 40 },
        4: { cellWidth: 12, halign: 'center' },
        5: { cellWidth: 66 },
      },
      didDrawPage: () => {
        const pageCount = doc.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(String(pageCount), pageSize.getWidth() / 2, pageSize.getHeight() - 8, { align: 'center' });
      },
    });

    if (this._pdfBlobUrl) URL.revokeObjectURL(this._pdfBlobUrl);
    this._pdfBlobUrl = URL.createObjectURL(doc.output('blob'));
    this.pdfPreviewSafeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this._pdfBlobUrl));
    this.pdfFileName.set(`${this.exportFileBaseName()}.pdf`);
    this.pdfPreviewOpen.set(true);
  }

  closePdfPreview(): void {
    this.pdfPreviewOpen.set(false);
    if (this._pdfBlobUrl) {
      URL.revokeObjectURL(this._pdfBlobUrl);
      this._pdfBlobUrl = '';
    }
    this.pdfPreviewSafeUrl.set(null);
  }

  downloadPdf(): void {
    const a = document.createElement('a');
    a.href = this._pdfBlobUrl;
    a.download = this.pdfFileName();
    a.click();
  }

  setPageIndex(next: number): void {
    this.pageIndex.set(next);
  }

  setPageSize(next: number): void {
    this.pageSize.set(next);
    this.pageIndex.set(0);
  }

  get pagedCandidates(): Candidate[] {
    const start = this.pageIndex() * this.pageSize();
    return this.candidates().slice(start, start + this.pageSize());
  }

  distributeCandidates(): void {
    const year = this.activeSchoolYear();
    if (!year) {
      this.openDialog({
        title: 'Année scolaire',
        message: 'Aucune année scolaire active trouvée.',
        variant: 'error',
      });
      return;
    }

    this.openDialog({
      title: 'Répartition automatique',
      message: `Répartir automatiquement les candidats de ${year.year} dans les centres ?`,
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.candidateService.distributeCandidates(year.id).subscribe({
          next: (res) => {
            const items = (res.assignments ?? [])
              .slice(0, 50)
              .map((a) => `${a.candidate.lastName} ${a.candidate.firstName} → ${a.center.name}`);

            this.openDialog({
              title: 'Répartition effectuée',
              message: res.message,
              variant: 'success',
              items,
            });
            this.loadCandidates();
          },
          error: (err) => {
            console.error('Erreur répartition candidats', err);
            const message = err?.error?.message || 'Erreur lors de la répartition des candidats.';
            this.openDialog({
              title: 'Répartition impossible',
              message,
              variant: 'error',
            });
            this.loading.set(false);
          },
        });
      },
    });
  }

  generatePV(): void {
    const year = this.activeSchoolYear();
    if (!year) {
      this.openDialog({
        title: 'Année scolaire',
        message: 'Aucune année scolaire active trouvée.',
        variant: 'error',
      });
      return;
    }

    this.openDialog({
      title: 'Génération des numéros PV',
      message: `Générer les numéros PV pour les candidats affectés de ${year.year} ?`,
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.candidateService.generatePV(year.id).subscribe({
          next: (res) => {
            const items = (res.pvAssignments ?? [])
              .slice(0, 50)
              .map((p) => `${p.candidate.lastName} ${p.candidate.firstName} → ${p.numeroPV}`);
            this.openDialog({
              title: 'PV attribués',
              message: res.message,
              variant: 'success',
              items,
            });
            this.loadCandidates();
          },
          error: (err) => {
            console.error('Erreur génération PV', err);
            const message = err?.error?.message
              || "Impossible de générer les numéros PV. Affectez d'abord les candidats à un centre.";
            this.openDialog({
              title: 'Génération PV impossible',
              message,
              variant: 'error',
            });
            this.loading.set(false);
          },
        });
      },
    });
  }

  openCreateDrawer(): void {
    this.editMode.set(false);
    this.formData.set({
      firstName: '',
      lastName: '',
      gender: 'MASCULIN',
      dateOfBirth: '',
      placeOfBirth: '',
      nationality: 'Burkinabé',
      schoolId: '',
      schoolYearId: ''
    });
    this.showDrawer.set(true);
  }

  openEditDrawer(candidate: Candidate): void {
    this.editMode.set(true);
    this.selectedCandidate.set(candidate);
    this.formData.set({
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      gender: candidate.gender as 'MASCULIN' | 'FEMININ',
      dateOfBirth: candidate.dateOfBirth.split('T')[0],
      placeOfBirth: candidate.placeOfBirth,
      nationality: candidate.nationality,
      schoolId: candidate.schoolId,
      schoolYearId: candidate.schoolYearId
    });
    this.showDrawer.set(true);
  }

  closeDrawer(): void {
    this.showDrawer.set(false);
    this.selectedCandidate.set(null);
  }

  saveCandidate(): void {
    this.loading.set(true);
    
    if (this.editMode() && this.selectedCandidate()) {
      this.candidateService.update(this.selectedCandidate()!.id, this.formData()).subscribe({
        next: () => {
          this.loadCandidates();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur mise à jour candidat', err);
          this.loading.set(false);
        }
      });
    } else {
      this.candidateService.create(this.formData()).subscribe({
        next: () => {
          this.loadCandidates();
          this.closeDrawer();
        },
        error: (err) => {
          console.error('Erreur création candidat', err);
          this.loading.set(false);
        }
      });
    }
  }

  deleteCandidate(id: string): void {
    this.openDialog({
      title: 'Suppression',
      message: 'Êtes-vous sûr de vouloir supprimer ce candidat ?',
      variant: 'confirm',
      onConfirm: () => {
        this.loading.set(true);
        this.candidateService.delete(id).subscribe({
          next: () => this.loadCandidates(),
          error: (err) => {
            console.error('Erreur suppression candidat', err);
            const message = err?.error?.message || 'Erreur lors de la suppression du candidat.';
            this.openDialog({
              title: 'Suppression impossible',
              message,
              variant: 'error',
            });
            this.loading.set(false);
          },
        });
      },
    });
  }
}
