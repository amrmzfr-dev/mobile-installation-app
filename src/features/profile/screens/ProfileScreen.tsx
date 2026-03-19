import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Spacing, Typography } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import NotificationBell from '../../../components/common/NotificationBell';
import { listInstallations } from '../../../services/jobs.service';
import { RootStackParamList } from '../../../navigation/types';

function StatBox({ value, label, color }: { value: string; label: string; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  iconColor,
  placeholder,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string | null | undefined;
  iconColor: string;
  placeholder?: string;
}) {
  const { colors } = useTheme();
  const display = value || (placeholder ?? 'Add...');
  const isMissing = !value;
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.infoIconWrap, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: isMissing ? colors.textMuted : colors.textPrimary }]}>
          {display}
        </Text>
      </View>
    </View>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function ProfileScreen() {
  const { isDark, colors, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [completedCount, setCompletedCount] = useState<number | null>(null);

  useEffect(() => {
    listInstallations()
      .then((data) => {
        const list: any[] = Array.isArray(data) ? data : (data as any).results ?? [];
        setCompletedCount(list.filter((i) => i.status === 'completed').length);
      })
      .catch(() => setCompletedCount(0));
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'SignIn' }] })
          );
        },
      },
    ]);
  };

  const name = user?.name ?? '';
  const initials = name ? getInitials(name) : '??';

  return (
    <ScreenWrapper>
      <StatusBar style={colors.statusBar} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profile</Text>
          <NotificationBell count={0} />
        </View>

        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{name || 'Add your name...'}</Text>
          <Text style={[styles.role, { color: colors.textSecondary }]}>{user?.role ?? 'EV Installer'}</Text>
          {user?.installerId ? (
            <View style={[styles.idBadge, { backgroundColor: isDark ? '#2DC88A18' : '#E8FAF3' }]}>
              <Ionicons name="card-outline" size={12} color={colors.primary} />
              <Text style={[styles.idText, { color: colors.primary }]}>ID: {user.installerId}</Text>
            </View>
          ) : null}
        </View>

        {/* Stats row */}
        <View style={[styles.statsCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <StatBox
            value={completedCount === null ? '—' : String(completedCount)}
            label="Completed"
            color={colors.primary}
          />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatBox value="—" label="Rating" color="#F5A623" />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatBox value="—" label="On-Time" color="#7C3AED" />
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <StatBox value="—" label="Response" color="#2563EB" />
        </View>

        {/* Contact Info */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={16} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Contact Info</Text>
          </View>
          <InfoRow icon="mail-outline" label="Email" value={user?.email} iconColor="#2563EB" />
          <InfoRow icon="call-outline" label="Phone" value={null} iconColor="#2DC88A" placeholder="Add phone number..." />
          <InfoRow icon="location-outline" label="Region" value={null} iconColor="#D97706" placeholder="Add region..." />
          <InfoRow icon="calendar-outline" label="Member Since" value={null} iconColor="#7C3AED" placeholder="—" />
        </View>

        {/* App Settings */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings-outline" size={16} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>App Settings</Text>
          </View>

          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconWrap, { backgroundColor: isDark ? '#F5A62320' : '#FFF8EC' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={16} color="#F5A623" />
              </View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBg}
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: 'transparent' }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconWrap, { backgroundColor: isDark ? '#2563EB20' : '#EFF6FF' }]}>
                <Ionicons name="notifications-outline" size={16} color="#2563EB" />
              </View>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Push Notifications</Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.cardBg}
            />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.dangerBg, borderColor: (colors.danger ?? '#FF3B30') + '40' }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger ?? '#FF3B30'} />
          <Text style={[styles.signOutText, { color: colors.danger ?? '#FF3B30' }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textMuted }]}>v1.0.0 · VoltInstall Pro</Text>
      </ScrollView>
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
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginHorizontal: Spacing.base,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarInitials: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  idBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  idText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.base,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  card: {
    marginHorizontal: Spacing.base,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: 14,
    paddingVertical: Spacing.base,
    marginHorizontal: Spacing.base,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: Spacing.xl,
  },
});
