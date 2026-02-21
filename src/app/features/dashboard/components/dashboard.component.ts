import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { StatCard, ActivityItem, ChartDataPoint } from '../../../models/dashboard.model';
import { timeAgo } from '../../../utils/date.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgClass, SpinnerComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Welcome back, {{ auth.user()?.name }}</p>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <app-spinner size="lg" />
      </div>
    } @else {
      <!-- Stats -->
      <div class="stats-grid">
        @for (stat of stats(); track stat.label) {
          <div class="stat-card" [ngClass]="'stat-card--' + stat.color">
            <div class="stat-icon">
              <span [innerHTML]="iconMap[stat.icon]"></span>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ stat.label }}</span>
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-change" [class.positive]="stat.change > 0" [class.negative]="stat.change < 0">
                {{ stat.change > 0 ? '↑' : '↓' }} {{ absVal(stat.change) }}% vs last month
              </span>
            </div>
          </div>
        }
      </div>

      <!-- Chart + Activity -->
      <div class="content-grid">
        <!-- Revenue Chart -->
        <app-card title="Revenue Overview">
          <div class="chart-container">
            <svg class="chart" viewBox="0 0 600 200" preserveAspectRatio="none">
              @for (line of gridLines; track line) {
                <line [attr.y1]="line" [attr.y2]="line" x1="0" x2="600"
                  stroke="var(--color-border)" stroke-width="1"/>
              }
              <path [attr.d]="areaPath()" fill="var(--color-primary)" opacity="0.08"/>
              <path [attr.d]="linePath()" fill="none" stroke="var(--color-primary)"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              @for (pt of chartPoints(); track pt.x) {
                <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="4"
                  fill="var(--color-primary)" stroke="var(--color-surface)" stroke-width="2"/>
              }
            </svg>
            <div class="chart-labels">
              @for (pt of chartData(); track pt.label) {
                <span>{{ pt.label }}</span>
              }
            </div>
          </div>
        </app-card>

        <!-- Activity Feed -->
        <app-card title="Recent Activity">
          <div class="activity-list">
            @for (item of activity(); track item.id) {
              <div class="activity-item">
                <div class="activity-icon" [ngClass]="'activity-icon--' + item.type">
                  {{ activityIcons[item.type] }}
                </div>
                <div class="activity-body">
                  <p class="activity-text">
                    <strong>{{ item.user }}</strong> {{ item.action }} {{ item.target }}
                  </p>
                  <span class="activity-time">{{ timeAgo(item.time) }}</span>
                </div>
              </div>
            }
          </div>
        </app-card>
      </div>
    }
  `,
  styles: [`
    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .stat-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      display: flex;
      align-items: flex-start;
      gap: var(--space-4);
      box-shadow: var(--shadow-sm);
      transition: box-shadow var(--transition-fast);

      &:hover { box-shadow: var(--shadow-md); }
    }

    .stat-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      ::ng-deep svg { width: 22px; height: 22px; }

      .stat-card--blue & { background: #dbeafe; color: #1d4ed8; }
      .stat-card--green & { background: #dcfce7; color: #15803d; }
      .stat-card--purple & { background: #ede9fe; color: #6d28d9; }
      .stat-card--orange & { background: #fed7aa; color: #c2410c; }
    }

    :host-context([data-theme='dark']) {
      .stat-card--blue .stat-icon { background: rgba(29,78,216,0.2); color: #60a5fa; }
      .stat-card--green .stat-icon { background: rgba(21,128,61,0.2); color: #4ade80; }
      .stat-card--purple .stat-icon { background: rgba(109,40,217,0.2); color: #a78bfa; }
      .stat-card--orange .stat-icon { background: rgba(194,65,12,0.2); color: #fb923c; }
    }

    .stat-body {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .stat-label {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .stat-value {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text);
      line-height: 1.2;
    }

    .stat-change {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);

      &.positive { color: var(--color-success); }
      &.negative { color: var(--color-error); }
    }

    .chart-container { padding-top: var(--space-2); }

    .chart {
      width: 100%;
      height: 180px;
      overflow: visible;
    }

    .chart-labels {
      display: flex;
      justify-content: space-between;
      padding-top: var(--space-2);
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .activity-item {
      display: flex;
      gap: var(--space-3);
      align-items: flex-start;
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      flex-shrink: 0;

      &--create  { background: var(--color-success-bg); }
      &--update  { background: var(--color-info-bg); }
      &--delete  { background: var(--color-error-bg); }
      &--login   { background: var(--color-primary-light); }
    }

    .activity-body { flex: 1; min-width: 0; }

    .activity-text {
      font-size: var(--font-size-sm);
      color: var(--color-text);
      margin: 0;
      line-height: 1.4;
    }

    .activity-time {
      font-size: var(--font-size-xs);
      color: var(--color-text-muted);
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(MockApiService);
  readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly stats = signal<StatCard[]>([]);
  readonly chartData = signal<ChartDataPoint[]>([]);
  readonly activity = signal<ActivityItem[]>([]);

  readonly gridLines = [40, 80, 120, 160];

  readonly chartPoints = computed(() => {
    const data = this.chartData();
    if (!data.length) return [];
    const maxVal = Math.max(...data.map((d) => d.value));
    const w = 600 / (data.length - 1);
    return data.map((d, i) => ({
      x: i * w,
      y: 180 - (d.value / maxVal) * 160,
    }));
  });

  readonly linePath = computed(() => {
    const pts = this.chartPoints();
    if (!pts.length) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  });

  readonly areaPath = computed(() => {
    const pts = this.chartPoints();
    if (!pts.length) return '';
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    return `${line} L${pts[pts.length - 1].x},180 L0,180 Z`;
  });

  readonly timeAgo = timeAgo;
  absVal(n: number): number { return Math.abs(n); }

  readonly iconMap: Record<string, string> = {
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    dollar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    shopping: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
    box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
  };

  readonly activityIcons: Record<string, string> = {
    create: '✚',
    update: '✎',
    delete: '✕',
    login: '→',
  };

  ngOnInit(): void {
    forkJoin({
      stats: this.api.getStats(),
      chart: this.api.getChartData(),
      activity: this.api.getActivity(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        this.stats.set(result.stats);
        this.chartData.set(result.chart);
        this.activity.set(result.activity);
        this.loading.set(false);
      });
  }
}
