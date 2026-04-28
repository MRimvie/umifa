import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent {
  @Input() loading = false;

  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 30, 40, 50];
  @Input() totalItems = 0;

  @Output() pageIndexChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get currentPageLabel(): string {
    return `${Math.min(this.pageIndex + 1, this.totalPages)} / ${this.totalPages}`;
  }

  canGoPrev(): boolean {
    return this.pageIndex > 0;
  }

  canGoNext(): boolean {
    return this.pageIndex < this.totalPages - 1;
  }

  goPrev(): void {
    if (!this.canGoPrev()) return;
    this.pageIndexChange.emit(this.pageIndex - 1);
  }

  goNext(): void {
    if (!this.canGoNext()) return;
    this.pageIndexChange.emit(this.pageIndex + 1);
  }

  onPageSizeChange(value: string | number): void {
    const next = typeof value === 'string' ? Number(value) : value;
    this.pageSizeChange.emit(next);
    this.pageIndexChange.emit(0);
  }
}
