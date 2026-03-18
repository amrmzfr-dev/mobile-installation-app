import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import { Job } from '../data/mock';

interface Props {
  job: Job;
  onPress?: () => void;
}

export default function JobCard({ job, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="flash" size={20} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{job.name}</Text>
          <Text style={[styles.jobId, { color: colors.textSecondary }]}>{job.jobId}</Text>
        </View>
        <Text style={[styles.location, { color: colors.textSecondary }]}>{job.location}</Text>
      </View>

      <View style={[styles.arrowButton, { backgroundColor: colors.primary }]}>
        <Ionicons name="open-outline" size={16} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: Spacing.sm,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  jobId: {
    fontSize: 12,
    fontWeight: '500',
  },
  location: {
    fontSize: 12,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
