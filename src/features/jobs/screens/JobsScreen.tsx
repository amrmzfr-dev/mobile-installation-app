import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, Pressable, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import NotificationBell from '../../../components/common/NotificationBell';
import SearchBar from '../../../components/common/SearchBar';
import FilterTabs from '../../../components/common/FilterTabs';
import type { FilterOption } from '../../../components/common/FilterTabs';
import JobCard from '../components/JobCard';
import { listInstallations } from '../../../services/jobs.service';
import { RootStackParamList } from '../../../navigation/types';
import { Job, JobCategory, JobStatus } from '../data/mock';

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'survey_scheduling', label: 'Survey Scheduling' },
  { id: 'survey_ready', label: 'Survey Ready' },
  { id: 'installation_scheduling', label: 'Install Scheduling' },
  { id: 'installation_ready', label: 'Install Ready' },
  { id: 'completed', label: 'Completed' },
];

type SortKey = 'newest' | 'oldest' | 'az' | 'za';

const SORT_OPTIONS: { id: SortKey; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'newest', label: 'Newest First', icon: 'arrow-down-outline' },
  { id: 'oldest', label: 'Oldest First', icon: 'arrow-up-outline' },
  { id: 'az', label: 'Name A → Z', icon: 'text-outline' },
  { id: 'za', label: 'Name Z → A', icon: 'text-outline' },
];

function mapStatusToFrontend(backendStatus: string): JobStatus {
  switch (backendStatus) {
    case 'pending-acceptance': return 'assigned';
    case 'accepted':
    case 'pending-survey-schedule': return 'survey_scheduling';
    case 'survey-scheduled':
    case 'survey-in-progress': return 'survey_ready';
    case 'approved-for-installation':
    case 'on-hold':
    case 'pending-installation-schedule': return 'installation_scheduling';
    case 'installation-scheduled':
    case 'in-progress': return 'installation_ready';
    case 'completed': return 'completed';
    default: return 'assigned';
  }
}

function mapInstallationToJob(inst: any): Job {
  return {
    id: String(inst.id),
    jobId: `#${String(inst.id).slice(-4).toUpperCase()}`,
    name: inst.customer?.name ?? 'Unknown',
    location: [inst.customer?.address?.street, inst.customer?.address?.city, inst.customer?.address?.state].filter(Boolean).join(', '),
    coords: {
      latitude: inst.customer?.address?.coordinates?.lat ?? 3.139,
      longitude: inst.customer?.address?.coordinates?.lng ?? 101.6869,
    },
    category: (inst.customer?.propertyType === 'residential' ? 'residential' : 'industrial') as JobCategory,
    status: mapStatusToFrontend(inst.status ?? ''),
    client: inst.customer?.name ?? '',
    phone: inst.customer?.phone ?? '',
    system: [inst.charger?.model, inst.charger?.powerOutput].filter(Boolean).join(' '),
    assignedDate: inst.timestamps?.assigned ?? inst.timestamps?.created ?? '',
    surveyDate: inst.scheduling?.survey_scheduled_date ?? undefined,
    installationDate: inst.scheduling?.installation_scheduled_date ?? undefined,
  };
}

export default function JobsScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('newest');
  const [sortVisible, setSortVisible] = useState(false);

  const currentSort = SORT_OPTIONS.find((s) => s.id === sortKey)!;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listInstallations();
      const mapped = (data.installations ?? []).map(mapInstallationToJob);
      setJobs(mapped);
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchJobs(); }, [fetchJobs]));

  const filteredJobs = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const matchesFilter = activeFilter === 'all' || job.status === activeFilter;
      const query = search.toLowerCase();
      const matchesSearch =
        job.name.toLowerCase().includes(query) ||
        job.jobId.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
    return [...filtered].sort((a, b) => {
      if (sortKey === 'newest') return new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime();
      if (sortKey === 'oldest') return new Date(a.assignedDate).getTime() - new Date(b.assignedDate).getTime();
      if (sortKey === 'az') return a.name.localeCompare(b.name);
      if (sortKey === 'za') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [jobs, search, activeFilter, sortKey]);

  return (
    <ScreenWrapper>
      <StatusBar style={colors.statusBar} />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Installations</Text>
        <NotificationBell count={0} />
      </View>
      <SearchBar placeholder="Search name or location..." value={search} onChangeText={setSearch} />
      <View style={styles.filterRow}>
        <View style={styles.filterTabsWrapper}>
          <FilterTabs options={FILTER_OPTIONS} activeId={activeFilter} onSelect={setActiveFilter} />
        </View>
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={() => setSortVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name={currentSort.icon} size={14} color={colors.textSecondary} />
          <Ionicons name="chevron-down" size={12} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.danger ?? '#FF3B30' }]}>{error}</Text>
          <TouchableOpacity onPress={fetchJobs} style={[styles.retryBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[styles.resultCount, { color: colors.textMuted }]}>
            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          </Text>
          <FlatList
            data={filteredJobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JobCard job={item} onPress={() => navigation.navigate('JobDetail', { jobId: item.id })} />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No jobs found.</Text>
            }
          />
        </>
      )}

      <Modal visible={sortVisible} transparent animationType="fade" onRequestClose={() => setSortVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSortVisible(false)}>
          <Pressable
            style={[styles.sortSheet, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
            onPress={() => {}}
          >
            <Text style={[styles.sortSheetTitle, { color: colors.textPrimary }]}>Sort by</Text>
            {SORT_OPTIONS.map((opt) => {
              const isActive = sortKey === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.sortOption,
                    { borderColor: colors.border },
                    isActive && { backgroundColor: isDark ? '#2DC88A22' : '#E8FAF3' },
                  ]}
                  onPress={() => { setSortKey(opt.id); setSortVisible(false); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={opt.icon} size={16} color={isActive ? colors.primary : colors.textSecondary} />
                  <Text
                    style={[
                      styles.sortOptionLabel,
                      { color: isActive ? colors.primary : colors.textPrimary },
                      isActive && { fontWeight: '700' },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={16} color={colors.primary} style={styles.sortCheck} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
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
  headerTitle: { ...Typography.h1 },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  filterTabsWrapper: { flex: 1 },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    marginRight: Spacing.base,
  },
  resultCount: { fontSize: 12, fontWeight: '500', paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.base },
  errorText: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyText: { textAlign: 'center', paddingTop: 40, fontSize: 14 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sortSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: Spacing.lg,
    paddingBottom: 36,
    paddingHorizontal: Spacing.base,
  },
  sortSheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.md },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 13,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  sortOptionLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  sortCheck: { marginLeft: 'auto' },
});
