import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import NotificationBell from '../../../components/common/NotificationBell';
import SectionHeader from '../../../components/common/SectionHeader';
import StatCard from '../components/StatCard';
import { listInstallations } from '../../../services/jobs.service';
import { RootStackParamList } from '../../../navigation/types';

interface Stats {
  completed: number;
  pendingAcceptance: number;
  inProgress: number;
  onHold: number;
}

interface UrgentAlert {
  id: string;
  title: string;
  description: string;
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [stats, setStats] = useState<Stats>({ completed: 0, pendingAcceptance: 0, inProgress: 0, onHold: 0 });
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const IN_PROGRESS_STATUSES = [
    'accepted', 'pending-survey-schedule', 'survey-scheduled', 'survey-in-progress',
    'approved-for-installation', 'pending-installation-schedule', 'installation-scheduled', 'in-progress',
  ];
  const ON_HOLD_STATUSES = ['on-hold', 'cannot-proceed', 'under-admin-review', 'failed'];

  function extractList(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data?.results && Array.isArray(data.results)) return data.results;
    if (data?.data && Array.isArray(data.data)) return data.data;
    // try first array-valued key
    for (const key of Object.keys(data ?? {})) {
      if (Array.isArray((data as any)[key])) return (data as any)[key];
    }
    return [];
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const raw = await listInstallations();
      const list = extractList(raw);
      console.log('[Dashboard] installations count:', list.length, 'statuses:', list.map((i: any) => i.status));

      const completed = list.filter((i: any) => i.status === 'completed').length;
      const pendingAcceptance = list.filter((i: any) => i.status === 'pending-acceptance').length;
      const inProgress = list.filter((i: any) => IN_PROGRESS_STATUSES.includes(i.status)).length;
      const onHold = list.filter((i: any) => ON_HOLD_STATUSES.includes(i.status)).length;
      setStats({ completed, pendingAcceptance, inProgress, onHold });

      const newJobs: UrgentAlert[] = list
        .filter((i: any) => i.status === 'pending-acceptance')
        .map((i: any) => ({
          id: String(i.id),
          title: `New Job: ${i.customer?.name ?? 'Unknown Customer'}`,
          description: `${i.customer?.address?.city ?? ''} · ${i.charger?.model ?? 'EV Charger'} · Tap to view`,
        }));
      setUrgentAlerts(newJobs);
    } catch (err) {
      console.error('[Dashboard] fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const STAT_ITEMS = [
    { id: '1', label: 'COMPLETED', value: String(stats.completed), iconName: 'checkmark-circle-outline', iconColor: '#2DC88A' },
    { id: '2', label: 'PENDING', value: String(stats.pendingAcceptance), iconName: 'time-outline', iconColor: '#4A90D9' },
    { id: '3', label: 'IN PROGRESS', value: String(stats.inProgress), iconName: 'flash-outline', iconColor: '#F5A623' },
    { id: '4', label: 'ON HOLD', value: String(stats.onHold), iconName: 'pause-circle-outline', iconColor: '#9B59B6' },
  ];

  return (
    <ScreenWrapper>
      <StatusBar style={colors.statusBar} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Dashboard</Text>
            {user?.name ? (
              <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Welcome, {user.name.split(' ')[0]}</Text>
            ) : null}
          </View>
          <NotificationBell count={stats.pendingAcceptance} />
        </View>

        {/* Stats 2x2 Grid */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard item={STAT_ITEMS[0]} />
              <StatCard item={STAT_ITEMS[1]} />
            </View>
            <View style={styles.statsRow}>
              <StatCard item={STAT_ITEMS[2]} />
              <StatCard item={STAT_ITEMS[3]} />
            </View>
          </View>
        )}

        {/* Urgent Alerts */}
        <View style={styles.section}>
          <SectionHeader
            title="URGENT ALERTS"
            icon="megaphone-outline"
            iconColor={colors.alertRed}
          />
          <View style={styles.sectionContent}>
            {urgentAlerts.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
                <Ionicons name="checkmark-circle-outline" size={28} color={colors.primary} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>All Clear</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No urgent alerts at the moment.</Text>
              </View>
            ) : (
              urgentAlerts.map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  style={[styles.alertCard, { backgroundColor: '#FFF5F5', borderColor: '#FF3B3030' }]}
                  onPress={() => navigation.navigate('JobDetail', { jobId: alert.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.alertIconWrap}>
                    <Ionicons name="alert-circle" size={20} color={colors.alertRed ?? '#FF3B30'} />
                  </View>
                  <View style={styles.alertText}>
                    <Text style={[styles.alertTitle, { color: colors.textPrimary }]}>{alert.title}</Text>
                    <Text style={[styles.alertDesc, { color: colors.textSecondary }]}>{alert.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Announcements */}
        <View style={styles.section}>
          <SectionHeader
            title="ANNOUNCEMENTS"
            icon="megaphone-outline"
            iconColor={colors.primary}
          />
          <View style={styles.sectionContent}>
            <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
              <Ionicons name="notifications-off-outline" size={28} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Announcements</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Check back later for updates from your team.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
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
  headerSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  loadingBox: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionContent: {
    paddingHorizontal: Spacing.base,
  },
  emptyCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  alertIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertDesc: {
    fontSize: 12,
    fontWeight: '500',
  },
});
