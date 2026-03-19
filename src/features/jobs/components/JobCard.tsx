import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import { Job, JobStatus } from '../data/mock';

interface Props {
  job: Job;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; short: string; color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  assigned: {
    label: 'Assigned',
    short: 'Assigned',
    color: '#64748B',
    bg: '#F1F5F9',
    icon: 'clipboard-outline',
  },
  survey_scheduling: {
    label: 'Survey Scheduling',
    short: 'Survey Sched.',
    color: '#D97706',
    bg: '#FEF3C7',
    icon: 'calendar-outline',
  },
  survey_ready: {
    label: 'Survey Ready',
    short: 'Survey Ready',
    color: '#B45309',
    bg: '#FDE68A',
    icon: 'calendar',
  },
  installation_scheduling: {
    label: 'Install Scheduling',
    short: 'Install Sched.',
    color: '#2563EB',
    bg: '#DBEAFE',
    icon: 'construct-outline',
  },
  installation_ready: {
    label: 'Install Ready',
    short: 'Install Ready',
    color: '#7C3AED',
    bg: '#EDE9FE',
    icon: 'hammer-outline',
  },
  completed: {
    label: 'Completed',
    short: 'Completed',
    color: '#059669',
    bg: '#D1FAE5',
    icon: 'checkmark-circle',
  },
};

export { STATUS_CONFIG };

export default function JobCard({ job, onPress }: Props) {
  const { colors, isDark } = useTheme();
  const status = STATUS_CONFIG[job.status];
  const badgeBg = isDark ? `${status.color}20` : status.bg;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Left accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: status.color }]} />

      {/* Main content */}
      <View style={styles.content}>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
          {job.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {job.jobId}&nbsp;&nbsp;·&nbsp;&nbsp;{job.location}
        </Text>
      </View>

      {/* Right: status + chevron */}
      <View style={styles.right}>
        <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
          <View style={[styles.dot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.short}</Text>
        </View>
        <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.chevron} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingRight: Spacing.sm,
    paddingLeft: 0,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  accentStrip: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: Spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  chevron: {
    marginLeft: 2,
  },
});
