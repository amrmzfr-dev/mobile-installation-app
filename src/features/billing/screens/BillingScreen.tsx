import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import NotificationBell from '../../../components/common/NotificationBell';
import SearchBar from '../../../components/common/SearchBar';
import FilterTabs from '../../../components/common/FilterTabs';
import type { FilterOption } from '../../../components/common/FilterTabs';

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
];

export default function BillingScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <ScreenWrapper>
      <StatusBar style={colors.statusBar} />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Billing</Text>
        <NotificationBell count={0} />
      </View>

      <SearchBar
        placeholder="Search Invoice ID..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterWrapper}>
        <FilterTabs
          options={FILTER_OPTIONS}
          activeId={activeFilter}
          onSelect={setActiveFilter}
        />
      </View>

      <View style={styles.emptyContainer}>
        <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="receipt-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Invoices Yet</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Your billing history will appear here once invoices are generated for completed jobs.
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.base,
  },
  headerTitle: {
    ...Typography.h1,
  },
  filterWrapper: {
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: Spacing.xl * 1.5,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
