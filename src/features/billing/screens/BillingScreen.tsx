import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Spacing, Typography } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import NotificationBell from '../../../components/common/NotificationBell';
import SearchBar from '../../../components/common/SearchBar';
import FilterTabs from '../../../components/common/FilterTabs';
import type { FilterOption } from '../../../components/common/FilterTabs';
import InvoiceCard from '../components/InvoiceCard';
import { INVOICES } from '../data/mock';

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
];

export default function BillingScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredInvoices = useMemo(() => {
    return INVOICES.filter((inv) => {
      const matchesFilter = activeFilter === 'all' || inv.status === activeFilter;
      const matchesSearch = inv.invoiceId.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [search, activeFilter]);

  return (
    <ScreenWrapper>
      <StatusBar style={colors.statusBar} />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Billing</Text>
        <NotificationBell count={2} />
      </View>

      <SearchBar
        placeholder="Search Invoice ID..."
        value={search}
        onChangeText={setSearch}
      />

      <FilterTabs
        options={FILTER_OPTIONS}
        activeId={activeFilter}
        onSelect={setActiveFilter}
      />

      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <InvoiceCard invoice={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
  },
});
