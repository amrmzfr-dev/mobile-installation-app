import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Spacing, Typography } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import NotificationBell from '../../../components/common/NotificationBell';
import SectionHeader from '../../../components/common/SectionHeader';
import StatCard from '../components/StatCard';
import AlertCard from '../components/AlertCard';
import NewsCard from '../components/NewsCard';
import { STATS, ALERTS, NEWS } from '../data/mock';

export default function DashboardScreen() {
  const { colors } = useTheme();

  return (
    <ScreenWrapper>
      <StatusBar style={colors.statusBar} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Dashboard</Text>
          <NotificationBell count={2} />
        </View>

        {/* Stats 2x2 Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard item={STATS[0]} />
            <StatCard item={STATS[1]} />
          </View>
          <View style={styles.statsRow}>
            <StatCard item={STATS[2]} />
            <StatCard item={STATS[3]} />
          </View>
        </View>

        {/* Urgent Alerts */}
        <View style={styles.section}>
          <SectionHeader
            title="URGENT ALERTS"
            icon="megaphone-outline"
            iconColor={colors.alertRed}
          />
          <View style={styles.sectionContent}>
            {ALERTS.map((alert) => (
              <AlertCard key={alert.id} item={alert} />
            ))}
          </View>
        </View>

        {/* Industry News */}
        <View style={styles.section}>
          <SectionHeader
            title="INDUSTRY NEWS"
            icon="newspaper-outline"
            iconColor={colors.primary}
          />
          <View style={styles.sectionContent}>
            {NEWS.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
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
});
