import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-wrapper">
      @if (loading()) {
        <div class="table-loading">
          <app-spinner size="md" />
        </div>
      }
      <table class="table" [class.table--loading]="loading()">
        <thead>
          <tr>
            @for (col of columns(); track col.key) {
              <th
                [style.width]="col.width"
                [class.sortable]="col.sortable"
                (click)="col.sortable && sort.emit(col.key)"
              >
                {{ col.label }}
                @if (col.sortable) {
                  <span class="sort-icon">↕</span>
                }
              </th>
            }
            @if (hasActions()) {
              <th class="th-actions">Actions</th>
            }
          </tr>
        </thead>
        <tbody>
          @if (!loading() && rows().length === 0) {
            <tr>
              <td [attr.colspan]="columns().length + (hasActions() ? 1 : 0)" class="empty-cell">
                <div class="empty-state">
                  <span class="empty-icon">📋</span>
                  <p>{{ emptyText() }}</p>
                </div>
              </td>
            </tr>
          } @else {
            <ng-content />
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .table-wrapper {
      position: relative;
      overflow-x: auto;
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .table-loading {
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
      border-radius: var(--radius-lg);
    }

    :host-context([data-theme='dark']) .table-loading {
      background: rgba(30,41,59,0.7);
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);

      &--loading { opacity: 0.4; }

      thead tr {
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border);
      }

      th {
        padding: 10px 14px;
        text-align: left;
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;

        &.sortable { cursor: pointer; user-select: none; }
        &.th-actions { text-align: right; }
      }

      td {
        padding: 12px 14px;
        color: var(--color-text);
        border-bottom: 1px solid var(--color-border);
        vertical-align: middle;
      }

      tbody tr {
        transition: background var(--transition-fast);
        &:last-child td { border-bottom: none; }
        &:hover { background: var(--color-bg); }
      }
    }

    .sort-icon {
      margin-left: 4px;
      font-size: 10px;
      opacity: 0.5;
    }

    .empty-cell { text-align: center; }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 48px 24px;
      color: var(--color-text-muted);
    }

    .empty-icon { font-size: 40px; opacity: 0.4; }
  `],
})
export class TableComponent {
  readonly columns = input<TableColumn[]>([]);
  readonly rows = input<unknown[]>([]);
  readonly loading = input(false);
  readonly hasActions = input(true);
  readonly emptyText = input('No records found');

  readonly sort = output<string>();
}
