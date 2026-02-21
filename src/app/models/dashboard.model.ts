export interface StatCard {
  label: string;
  value: string | number;
  change: number;
  icon: string;
  color: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: 'create' | 'update' | 'delete' | 'login';
}

export interface ChartDataPoint {
  label: string;
  value: number;
}
