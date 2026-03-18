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
import JobCard from '../components/JobCard';
import { JOBS } from '../data/mock';

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'residential', label: 'Residential' },
  { id: 'industrial', label: 'Industrial' },
];

export default function JobsScreen() {
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredJobs = useMemo(() => {
    return JOBS.filter((job) => {
      const matchesFilter = activeFilter === 'all' || job.category === activeFilter;
      const query = search.toLowerCase();
      const matchesSearch =
        job.name.toLowerCase().includes(query) ||
        job.jobId.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [search, activeFilter]);

  return (
    <ScreenWrapper>
      <StatusBar style={colors.statusBar} />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Installations</Text>
        <NotificationBell count={2} />
      </View>

      <SearchBar
        placeholder="Search ID or Location..."
        value={search}
        onChangeText={setSearch}
      />

      <FilterTabs
        options={FILTER_OPTIONS}
        activeId={activeFilter}
        onSelect={setActiveFilter}
      />

      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JobCard job={item} />}
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
