import { AlertType } from '../../../types/common.types';

export interface StatItem {
  id: string;
  label: string;
  value: string;
  iconName: string;
  iconColor: string;
}

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  time: string;
  emoji: string;
}

export const STATS: StatItem[] = [
  {
    id: '1',
    label: 'JOBS CLOSED',
    value: '12',
    iconName: 'checkmark-circle-outline',
    iconColor: '#2DC88A',
  },
  {
    id: '2',
    label: 'PENDING',
    value: '3',
    iconName: 'time-outline',
    iconColor: '#4A90D9',
  },
  {
    id: '3',
    label: 'SAFETY SCORE',
    value: '100%',
    iconName: 'shield-checkmark-outline',
    iconColor: '#9B59B6',
  },
  {
    id: '4',
    label: 'RESPONSE',
    value: '24h',
    iconName: 'trending-up-outline',
    iconColor: '#F5A623',
  },
];

export const ALERTS: AlertItem[] = [
  {
    id: '1',
    type: 'error',
    title: 'System Outage: Long Beach',
    description: 'Grid connectivity lost in Sector 4. Avoid dispatch until 14:00.',
  },
  {
    id: '2',
    type: 'warning',
    title: 'New Safety Protocol',
    description: 'Phase 2 grounding requirements updated. Review PDF in Profile.',
  },
];

export const NEWS: NewsItem[] = [
  { id: '1', title: 'Tesla opens NACS for all', time: '2h ago', emoji: '🚗' },
  { id: '2', title: 'New Level 3 charging tech', time: '5h ago', emoji: '⚡' },
  { id: '3', title: 'CA State Rebates updated', time: '1d ago', emoji: '📋' },
];
