import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { GradeService, CandidateResult } from '../../core/services/grade.service';
import { SchoolYearService, SchoolYear } from '../../core/services/school-year.service';
import { ExamCenterService, ExamCenter } from '../../core/services/exam-center.service';
import { SchoolService } from '../../core/services/school.service';
import { School } from '../../core/models/candidate.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent implements OnInit {
  private gradeService = inject(GradeService);
  private schoolYearService = inject(SchoolYearService);
  private centerService = inject(ExamCenterService);
  private schoolService = inject(SchoolService);
  private sanitizer = inject(DomSanitizer);

  schoolYears = signal<SchoolYear[]>([]);
  centers = signal<ExamCenter[]>([]);
  schools = signal<School[]>([]);
  results = signal<CandidateResult[]>([]);

  loading = signal(false);
  calculating = signal(false);

  selectedYearId = signal('');
  selectedCenterId = signal('');
  selectedSchoolId = signal('');
  resultFilter = signal<'all' | 'ADMIS' | 'AJOURNE' | 'EN_ATTENTE'>('all');

  pdfPreviewOpen = signal(false);
  pdfPreviewSafeUrl = signal<SafeResourceUrl | null>(null);
  pdfFileName = signal('');
  private _pdfBlobUrl = '';

  dialogOpen = signal(false);
  dialogTitle = signal('');
  dialogMessage = signal('');
  dialogVariant = signal<'info' | 'success' | 'error'>('info');

  filtered = computed(() => {
    const f = this.resultFilter();
    if (f === 'all') return this.results();
    return this.results().filter((r) => r.result === f);
  });

  stats = computed(() => {
    const all = this.results();
    const admis = all.filter((r) => r.result === 'ADMIS').length;
    const ajourne = all.filter((r) => r.result === 'AJOURNE').length;
    const enAttente = all.filter((r) => r.result === 'EN_ATTENTE').length;
    const taux = all.length > 0 ? Math.round((admis / all.length) * 100) : 0;
    return { total: all.length, admis, ajourne, enAttente, taux };
  });

  ngOnInit(): void {
    this.schoolYearService.getAll().subscribe((data) => {
      this.schoolYears.set(data);
      const active = data.find((y) => y.isActive);
      if (active) {
        this.selectedYearId.set(active.id);
        this.loadResults();
      }
    });
    this.centerService.getAll().subscribe((data) => this.centers.set(data));
    this.schoolService.getAll().subscribe((data) => this.schools.set(data));
  }

  loadResults(): void {
    const schoolYearId = this.selectedYearId();
    if (!schoolYearId) return;
    this.loading.set(true);
    this.gradeService
      .getResults({
        schoolYearId,
        centerId: this.selectedCenterId() || undefined,
        schoolId: this.selectedSchoolId() || undefined,
      })
      .subscribe({
        next: (data) => {
          this.results.set(data);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement résultats', err);
          this.loading.set(false);
        },
      });
  }

  onFiltersChange(): void {
    this.resultFilter.set('all');
    this.loadResults();
  }

  calculateAll(): void {
    const schoolYearId = this.selectedYearId();
    if (!schoolYearId) return;
    this.calculating.set(true);
    this.gradeService
      .calculateAll({
        schoolYearId,
        centerId: this.selectedCenterId() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.calculating.set(false);
          this.showDialog('success', 'Calcul terminé', `${res.processed} candidat(s) traités — ${res.admis} admis, ${res.ajourne} ajournés.`);
          this.loadResults();
        },
        error: (err) => {
          console.error('Erreur calcul', err);
          this.calculating.set(false);
          this.showDialog('error', 'Erreur', err?.error?.message || 'Erreur lors du calcul des moyennes.');
        },
      });
  }

  private showDialog(variant: 'info' | 'success' | 'error', title: string, message: string): void {
    this.dialogVariant.set(variant);
    this.dialogTitle.set(title);
    this.dialogMessage.set(message);
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  private selectedYearLabel(): string {
    return this.schoolYears().find((y) => y.id === this.selectedYearId())?.year || '';
  }

  private selectedCenterName(): string {
    return this.centers().find((c) => c.id === this.selectedCenterId())?.name || '';
  }

  async exportPdf(filter: 'ADMIS' | 'AJOURNE'): Promise<void> {
    const rows = this.results().filter((r) => r.result === filter);
    if (!rows.length) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    let arabicFont = 'helvetica';
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
        arabicFont = 'Amiri';
      }
    } catch (_) {}

    const yearLabel = this.selectedYearLabel();
    const centerName = this.selectedCenterName();
    const pageWidth = doc.internal.pageSize.getWidth();
    const mL = 14;
    const mR = pageWidth - 14;

    let y = 14;

    const headerRows = [
      { fr: 'BURKINA FASO',                   ar: 'بوركينا فاسو' },
      { fr: 'UNION DES MEDERSAS ISLAMIQUES',  ar: 'اتحاد المدارس الإسلامية' },
      { fr: 'FRANCO-ARABE (UMIFA)',            ar: 'العربية الفرنسية (UMIFA)' },
      { fr: 'SERVICE DES EXAMENS',            ar: 'إدارة الامتحانات' },
    ];
    doc.setFontSize(9);
    for (const row of headerRows) {
      doc.setFont('helvetica', 'normal');
      doc.text(row.fr, mL, y);
      doc.setFont(arabicFont, 'normal');
      doc.text(row.ar, mR, y, { align: 'right' });
      y += 5;
    }

    y += 1;
    doc.setLineWidth(0.3);
    doc.line(mL, y, mR, y);
    y += 5;

    if (centerName) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`CENTRE : ${centerName}`, pageWidth / 2, y, { align: 'center' });
      y += 6;
    }

    const listLabel = filter === 'ADMIS'
      ? `LISTE DES CANDIDATS ADMIS AU CEP FRANCO-ARABE${yearLabel ? ` (SESSION ${yearLabel})` : ''}`
      : `LISTE DES CANDIDATS AJOURNÉS AU CEP FRANCO-ARABE${yearLabel ? ` (SESSION ${yearLabel})` : ''}`;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(listLabel, pageWidth / 2, y, { align: 'center' });
    y += 6;

    const arLabel = filter === 'ADMIS'
      ? `قائمة المرشحين الناجحين في امتحان الشهادة الابتدائية${yearLabel ? ` ( دورة ${yearLabel})` : ''}`
      : `قائمة المرشحين الراسبين في امتحان الشهادة الابتدائية${yearLabel ? ` ( دورة ${yearLabel})` : ''}`;
    doc.setFontSize(10);
    doc.setFont(arabicFont, 'normal');
    doc.text(arLabel, pageWidth / 2, y, { align: 'center' });
    y += 6;

    const head = [['N°', 'N°de PV', 'NOM', 'PRENOM(S)', 'SEXE', 'ÉCOLE', 'CENTRE', 'TOTAL', 'MOYENNE']];
    const body = rows.map((r, idx) => [
      String(idx + 1),
      r.numeroPV || '',
      r.lastName,
      r.firstName,
      r.gender === 'MASCULIN' ? 'M' : 'F',
      r.school?.name || '',
      r.center?.name || '',
      r.totalScore != null ? r.totalScore.toFixed(1) : '-',
      r.average != null ? r.average.toFixed(2) + '/10' : '-',
    ]);

    autoTable(doc, {
      head,
      body,
      startY: y + 2,
      styles: { font: 'helvetica', fontSize: 8, cellPadding: 1.5, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', lineColor: [0, 0, 0], lineWidth: 0.2 },
      theme: 'grid',
      margin: { left: mL, right: 14 },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 10, halign: 'center' },
        5: { cellWidth: 38 },
        6: { cellWidth: 28 },
        7: { cellWidth: 14, halign: 'center' },
        8: { cellWidth: 16, halign: 'center' },
      },
      didDrawPage: () => {
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(String(pageCount), pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
      },
    });

    if (this._pdfBlobUrl) URL.revokeObjectURL(this._pdfBlobUrl);
    this._pdfBlobUrl = URL.createObjectURL(doc.output('blob'));
    this.pdfPreviewSafeUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this._pdfBlobUrl));
    this.pdfFileName.set(`liste_${filter.toLowerCase()}_${yearLabel}.pdf`);
    this.pdfPreviewOpen.set(true);
  }

  closePdfPreview(): void {
    this.pdfPreviewOpen.set(false);
    if (this._pdfBlobUrl) { URL.revokeObjectURL(this._pdfBlobUrl); this._pdfBlobUrl = ''; }
    this.pdfPreviewSafeUrl.set(null);
  }

  downloadPdf(): void {
    const a = document.createElement('a');
    a.href = this._pdfBlobUrl;
    a.download = this.pdfFileName();
    a.click();
  }
}
