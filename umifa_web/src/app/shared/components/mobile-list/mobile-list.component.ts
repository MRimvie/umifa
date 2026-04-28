import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-mobile-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-list.component.html',
  styleUrls: ['./mobile-list.component.scss'],
})
export class MobileListComponent<TItem = unknown> {
  @Input() items: TItem[] = [];
  @Input() loading = false;

  @Input() summaryTemplate!: TemplateRef<{ $implicit: TItem }>; // required

  @Output() selectItem = new EventEmitter<TItem>();

  onSelect(item: TItem): void {
    this.selectItem.emit(item);
  }
}
