import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, Linking, ActivityIndicator, Modal, Pressable, Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { Spacing } from '../../../theme';
import { toTitleCase } from '../../../utils/text';
import {
  getInstallation, acceptJob, rejectJob, updateStatus, putInstallation,
  InstallationStatus,
} from '../../../services/jobs.service';

type Props = NativeStackScreenProps<RootStackParamList, 'JobDetail'>;

const STEPS = ['ASSIGNED', 'SURVEY', 'INSTALL', 'DONE'] as const;

function getStepIndex(status: string): number {
  if (status === 'pending-acceptance') return 0;
  if (['accepted', 'pending-survey-schedule', 'survey-scheduled', 'survey-in-progress'].includes(status)) return 1;
  if (['approved-for-installation', 'on-hold', 'pending-installation-schedule', 'installation-scheduled', 'in-progress'].includes(status)) return 2;
  if (status === 'completed') return 3;
  return 0;
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    'pending-acceptance': 'Pending Acceptance',
    'accepted': 'Accepted',
    'pending-survey-schedule': 'Schedule Survey',
    'survey-scheduled': 'Survey Scheduled',
    'survey-in-progress': 'Survey In Progress',
    'approved-for-installation': 'Approved',
    'on-hold': 'On Hold',
    'cannot-proceed': 'Cannot Proceed',
    'pending-installation-schedule': 'Schedule Installation',
    'installation-scheduled': 'Installation Scheduled',
    'in-progress': 'In Progress',
    'completed': 'Completed',
  };
  return map[status] ?? status;
}

export default function JobDetailScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [installation, setInstallation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [scheduleType, setScheduleType] = useState<'survey' | 'install'>('survey');
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [showPicker, setShowPicker] = useState(false);
  const [dateConfirmed, setDateConfirmed] = useState(false);

  async function fetchInstallation() {
    setLoading(true);
    setError('');
    try {
      const data = await getInstallation(jobId);
      setInstallation(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load job.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchInstallation(); }, [jobId]);

  async function handleAccept() {
    setSubmitting(true);
    try {
      await acceptJob(jobId);
      await fetchInstallation();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    Alert.alert('Reject Job', 'Are you sure you want to reject this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          setSubmitting(true);
          try {
            await rejectJob(jobId);
            navigation.goBack();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  }

  function openScheduleModal(type: 'survey' | 'install') {
    setScheduleType(type);
    setSelectedDateTime(new Date());
    setPickerMode('date');
    setDateConfirmed(false);
    setShowPicker(true);
    setScheduleVisible(true);
  }

  function formatDate(d: Date): string {
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function formatTime(d: Date): string {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; // HH:MM
  }

  function formatDisplayDate(d: Date): string {
    return d.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatDisplayTime(d: Date): string {
    return d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function handlePickerChange(_event: any, date?: Date) {
    if (!date) { setShowPicker(false); return; }
    const updated = new Date(selectedDateTime);
    if (pickerMode === 'date') {
      updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setSelectedDateTime(updated);
      setShowPicker(false);
      setDateConfirmed(true);
      // On Android auto-advance to time picker
      if (Platform.OS === 'android') {
        setTimeout(() => { setPickerMode('time'); setShowPicker(true); }, 100);
      }
    } else {
      updated.setHours(date.getHours(), date.getMinutes());
      setSelectedDateTime(updated);
      setShowPicker(false);
    }
  }

  async function handleConfirmSchedule() {
    if (!dateConfirmed) {
      Alert.alert('Required', 'Please select a date and time.');
      return;
    }
    setScheduleVisible(false);
    setSubmitting(true);
    try {
      const schedulingPayload = scheduleType === 'survey'
        ? { survey_scheduled_date: formatDate(selectedDateTime), survey_scheduled_time: formatTime(selectedDateTime) }
        : { installation_scheduled_date: formatDate(selectedDateTime), installation_scheduled_time: formatTime(selectedDateTime) };
      await putInstallation(jobId, { scheduling: schedulingPayload });
      const nextStatus: InstallationStatus = scheduleType === 'survey' ? 'survey-scheduled' : 'installation-scheduled';
      await updateStatus(jobId, nextStatus);
      await fetchInstallation();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(status: InstallationStatus) {
    setSubmitting(true);
    try {
      await updateStatus(jobId, status);
      await fetchInstallation();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCall() {
    const phone = installation?.customer?.phone;
    if (phone) Linking.openURL(`tel:${phone}`);
  }

  function handleNavigate() {
    const lat = installation?.customer?.address?.coordinates?.lat;
    const lng = installation?.customer?.address?.coordinates?.lng;
    if (!lat || !lng) return;
    Alert.alert('Open Navigation', 'Choose a navigation app', [
      {
        text: 'Google Maps',
        onPress: () => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`),
      },
      {
        text: 'Waze',
        onPress: () => Linking.openURL(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function renderCTA() {
    if (submitting) return <ActivityIndicator color={colors.primary} />;
    const status = installation?.status ?? '';
    switch (status) {
      case 'pending-acceptance':
        return (
          <View style={styles.dualCTA}>
            <TouchableOpacity
              style={[styles.rejectBtn, { borderColor: colors.danger ?? '#FF3B30' }]}
              onPress={handleReject}
            >
              <Text style={[styles.rejectBtnText, { color: colors.danger ?? '#FF3B30' }]}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
              onPress={handleAccept}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Accept Job</Text>
            </TouchableOpacity>
          </View>
        );
      case 'accepted':
        return (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={() => openScheduleModal('survey')}
          >
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Set Survey Date</Text>
          </TouchableOpacity>
        );
      case 'pending-survey-schedule':
        return (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={() => openScheduleModal('survey')}
          >
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Confirm Survey Date</Text>
          </TouchableOpacity>
        );
      case 'survey-scheduled':
        return (
          <View style={styles.dualCTA}>
            <TouchableOpacity
              style={[styles.rejectBtn, { borderColor: colors.border }]}
              onPress={() => handleStatusChange('pending-survey-schedule')}
            >
              <Text style={[styles.rejectBtnText, { color: colors.textSecondary }]}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('HomeSurveyForm', { jobId })}
            >
              <Ionicons name="flash-outline" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Start Survey</Text>
            </TouchableOpacity>
          </View>
        );
      case 'survey-in-progress':
        return (
          <View style={[styles.completedBadge, { backgroundColor: colors.primaryLight }]}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={[styles.completedText, { color: colors.primary }]}>Survey In Progress</Text>
          </View>
        );
      case 'approved-for-installation':
        return (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={() => openScheduleModal('install')}
          >
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Set Installation Date</Text>
          </TouchableOpacity>
        );
      case 'pending-installation-schedule':
        return (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={() => openScheduleModal('install')}
          >
            <Ionicons name="calendar-outline" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Confirm Install Date</Text>
          </TouchableOpacity>
        );
      case 'installation-scheduled':
        return (
          <View style={styles.dualCTA}>
            <TouchableOpacity
              style={[styles.rejectBtn, { borderColor: colors.border }]}
              onPress={() => handleStatusChange('pending-installation-schedule')}
            >
              <Text style={[styles.rejectBtnText, { color: colors.textSecondary }]}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('InstallationForm', { jobId })}
            >
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Start Installation</Text>
            </TouchableOpacity>
          </View>
        );
      case 'in-progress':
        return (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('InstallationForm', { jobId })}
          >
            <Ionicons name="flash" size={18} color="#fff" />
            <Text style={styles.ctaBtnText}>Continue Installation</Text>
          </TouchableOpacity>
        );
      case 'on-hold':
        return (
          <View style={styles.dualCTA}>
            <TouchableOpacity
              style={[styles.rejectBtn, { borderColor: colors.danger ?? '#FF3B30' }]}
              onPress={() => handleStatusChange('cannot-proceed')}
            >
              <Text style={[styles.rejectBtnText, { color: colors.danger ?? '#FF3B30' }]}>Cannot Proceed</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.acceptBtn, { backgroundColor: colors.primary }]}
              onPress={() => handleStatusChange('pending-installation-schedule')}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.ctaBtnText}>Resolved</Text>
            </TouchableOpacity>
          </View>
        );
      case 'cannot-proceed':
        return (
          <View style={[styles.completedBadge, { backgroundColor: '#FFE5E5' }]}>
            <Ionicons name="close-circle" size={20} color="#FF3B30" />
            <Text style={[styles.completedText, { color: '#FF3B30' }]}>Cannot Proceed</Text>
          </View>
        );
      case 'completed':
        return (
          <View style={[styles.completedBadge, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
            <Text style={[styles.completedText, { color: colors.primary }]}>Installation Completed</Text>
          </View>
        );
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }]}>
        <Text style={{ color: colors.danger ?? '#FF3B30', marginBottom: 16, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity onPress={fetchInstallation} style={[styles.acceptBtn, { backgroundColor: colors.primary }]}>
          <Text style={styles.ctaBtnText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = installation?.status ?? '';
  const activeStep = getStepIndex(status);
  const coords = {
    latitude: installation?.customer?.address?.coordinates?.lat ?? 3.139,
    longitude: installation?.customer?.address?.coordinates?.lng ?? 101.6869,
  };
  const surveyDate = installation?.scheduling?.survey_scheduled_date;
  const installDate = installation?.scheduling?.installation_scheduled_date;
  const address = [
    installation?.customer?.address?.street,
    installation?.customer?.address?.city,
    installation?.customer?.address?.state,
  ].filter(Boolean).join(', ');

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar} />
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>
          {toTitleCase(installation?.customer?.name) || 'Job Detail'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Map */}
        <View style={[styles.mapContainer, { borderColor: colors.border }]}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            initialRegion={{ ...coords, latitudeDelta: 0.005, longitudeDelta: 0.005 }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker coordinate={coords} />
          </MapView>
          {/* Transparent overlay to capture taps — MapView eats touches on Android */}
          <Pressable style={StyleSheet.absoluteFillObject} onPress={handleNavigate} />
          <TouchableOpacity
            style={[styles.navButton, { backgroundColor: colors.primary }]}
            onPress={handleNavigate}
          >
            <Ionicons name="navigate" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stepper */}
        <View style={styles.stepperContainer}>
          {STEPS.map((label, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <View key={label} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepBar,
                    {
                      backgroundColor: done || active ? colors.primary : colors.border,
                      opacity: active ? 1 : done ? 0.9 : 0.35,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: done || active ? colors.primary : colors.textSecondary,
                      fontWeight: active ? '700' : '500',
                    },
                  ]}
                >
                  {label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Status */}
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.statusBadgeText, { color: colors.primary }]}>{getStatusLabel(status)}</Text>
          </View>
        </View>

        {/* Client + System */}
        <View style={styles.rowCards}>
          <View style={[styles.infoCard, styles.halfCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>CLIENT</Text>
            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>{toTitleCase(installation?.customer?.name) || '—'}</Text>
          </View>
          <View style={[styles.infoCard, styles.halfCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>CHARGER</Text>
            <Text style={[styles.cardValue, { color: colors.textPrimary }]} numberOfLines={2}>
              {[installation?.charger?.model, installation?.charger?.powerOutput].filter(Boolean).join(' ') || '—'}
            </Text>
          </View>
        </View>

        {/* VSO + Type */}
        <View style={styles.rowCards}>
          <View style={[styles.infoCard, styles.halfCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>VSO NO</Text>
            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>{installation?.customer?.vsoNumber ?? '—'}</Text>
          </View>
          <View style={[styles.infoCard, styles.halfCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>TYPE</Text>
            <Text style={[styles.cardValue, { color: colors.textPrimary }]}>{toTitleCase(installation?.customer?.propertyType) || '—'}</Text>
          </View>
        </View>

        {/* Phone */}
        <TouchableOpacity onPress={handleCall} activeOpacity={0.8}>
          <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.phoneRow}>
              <View style={[styles.phoneIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="call-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.phoneText}>
                <Text style={[styles.phoneNumber, { color: colors.textPrimary }]}>{installation?.customer?.phone ?? '—'}</Text>
                <Text style={[styles.phoneSub, { color: colors.textSecondary }]}>Tap to call client</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Dates */}
        {(surveyDate || installDate) && (
          <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            {surveyDate && (
              <View style={styles.dateRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <View style={styles.dateText}>
                  <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>SURVEY DATE</Text>
                  <Text style={[styles.cardValue, { color: colors.primary }]}>{surveyDate}</Text>
                </View>
              </View>
            )}
            {surveyDate && installDate && <View style={[styles.dateDivider, { backgroundColor: colors.border }]} />}
            {installDate && (
              <View style={styles.dateRow}>
                <Ionicons name="hammer-outline" size={16} color={colors.textSecondary} />
                <View style={styles.dateText}>
                  <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>INSTALL DATE</Text>
                  <Text style={[styles.cardValue, { color: colors.primary }]}>{installDate}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Address */}
        {!!address && (
          <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
            <View style={styles.phoneRow}>
              <View style={[styles.phoneIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.phoneText}>
                <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>ADDRESS</Text>
                <Text style={[styles.cardValue, { color: colors.textPrimary }]}>{address}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View
        style={[
          styles.ctaContainer,
          { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 },
        ]}
      >
        {renderCTA()}
      </View>

      {/* Native date/time picker (Android spinner) */}
      {showPicker && (
        <DateTimePicker
          value={selectedDateTime}
          mode={pickerMode}
          display="default"
          onChange={handlePickerChange}
          minimumDate={new Date()}
        />
      )}

      {/* Schedule Modal */}
      <Modal
        visible={scheduleVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setScheduleVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setScheduleVisible(false)}>
          <Pressable
            style={[styles.scheduleSheet, { backgroundColor: colors.cardBg, paddingBottom: insets.bottom + 20 }]}
            onPress={() => {}}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.scheduleTitle, { color: colors.textPrimary }]}>
              {scheduleType === 'survey' ? 'Set Survey Date & Time' : 'Set Installation Date & Time'}
            </Text>

            {/* Date row */}
            <TouchableOpacity
              style={[styles.datePickerRow, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => { setPickerMode('date'); setShowPicker(true); }}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View style={styles.datePickerText}>
                <Text style={[styles.scheduleLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Date</Text>
                <Text style={[styles.datePickerValue, { color: dateConfirmed ? colors.textPrimary : colors.textMuted }]}>
                  {dateConfirmed ? formatDisplayDate(selectedDateTime) : 'Tap to select date'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Time row */}
            <TouchableOpacity
              style={[styles.datePickerRow, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => { setPickerMode('time'); setShowPicker(true); }}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={styles.datePickerText}>
                <Text style={[styles.scheduleLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Time</Text>
                <Text style={[styles.datePickerValue, { color: dateConfirmed ? colors.textPrimary : colors.textMuted }]}>
                  {dateConfirmed ? formatDisplayTime(selectedDateTime) : 'Tap to select time'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.dualCTA, { marginTop: Spacing.base }]}>
              <TouchableOpacity
                style={[styles.rejectBtn, { borderColor: colors.border, flex: 1 }]}
                onPress={() => setScheduleVisible(false)}
              >
                <Text style={[styles.rejectBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.acceptBtn, { backgroundColor: dateConfirmed ? colors.primary : colors.border }]}
                onPress={handleConfirmSchedule}
              >
                <Text style={styles.ctaBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },
  mapContainer: {
    height: 180,
    borderRadius: 16,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    borderWidth: 1,
  },
  navButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  stepperContainer: { flexDirection: 'row', marginBottom: Spacing.base, gap: 6 },
  stepItem: { flex: 1, alignItems: 'center', gap: 6 },
  stepBar: { width: '100%', height: 4, borderRadius: 2 },
  stepLabel: { fontSize: 9, letterSpacing: 0.8 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  statusLabel: { fontSize: 13, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  rowCards: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  halfCard: { flex: 1 },
  infoCard: {
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  cardValue: { fontSize: 15, fontWeight: '700' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  phoneIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  phoneText: { flex: 1 },
  phoneNumber: { fontSize: 15, fontWeight: '700' },
  phoneSub: { fontSize: 11, marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateText: { flex: 1 },
  dateDivider: { height: 1, marginVertical: Spacing.sm },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  dualCTA: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: { fontSize: 15, fontWeight: '700' },
  acceptBtn: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  completedBadge: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedText: { fontSize: 15, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  scheduleSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.base,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.base },
  scheduleTitle: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.base },
  scheduleLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  datePickerText: { flex: 1 },
  datePickerValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
});
