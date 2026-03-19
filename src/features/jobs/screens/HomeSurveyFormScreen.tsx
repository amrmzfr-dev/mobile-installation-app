import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { Spacing } from '../../../theme';
import { toTitleCase } from '../../../utils/text';
import SignaturePad from '../../../components/common/SignaturePad';
import PhotoViewer from '../../../components/common/PhotoViewer';
import {
  getInstallation,
  putInstallation,
  updateStatus,
  uploadDocument,
} from '../../../services/jobs.service';

// ─── Types ─────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<RootStackParamList, 'HomeSurveyForm'>;
type YesNoNull = 'yes' | 'no' | null;
type Outcome = 'approved' | 'on-hold' | null;

// ─── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{label}</Text>
  );
}

function FieldCard({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: any;
}) {
  return (
    <View style={[styles.fieldCard, { backgroundColor: colors.cardBg, shadowColor: colors.textPrimary }]}>
      <View style={[styles.fieldCardAccent, { backgroundColor: colors.primary }]} />
      <View style={styles.fieldCardInner}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
        {children}
      </View>
    </View>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
  colors,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  colors: any;
}) {
  return (
    <View style={styles.radioRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.radioBtn,
            {
              backgroundColor: value === opt ? colors.primary : colors.cardBg,
              borderColor: value === opt ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onChange(opt)}
        >
          <Text
            style={[
              styles.radioBtnText,
              { color: value === opt ? '#fff' : colors.textSecondary },
            ]}
          >
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CheckboxGroup({
  options,
  values,
  onChange,
  colors,
}: {
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
  colors: any;
}) {
  function toggle(opt: string) {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  }
  return (
    <View style={styles.radioRow}>
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            style={[
              styles.checkboxBtn,
              {
                backgroundColor: active ? colors.primary : colors.cardBg,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
            onPress={() => toggle(opt)}
          >
            <Text
              style={[styles.radioBtnText, { color: active ? '#fff' : colors.textSecondary }]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function InlineInput({
  value,
  onChange,
  placeholder,
  keyboardType,
  colors,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  colors: any;
  suffix?: string;
}) {
  return (
    <View style={styles.inlineInputRow}>
      <TextInput
        style={[
          styles.inlineInput,
          { flex: 1, color: colors.textPrimary, borderColor: colors.border },
        ]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder ?? ''}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType ?? 'default'}
      />
      {!!suffix && (
        <Text style={[styles.inputSuffix, { color: colors.textSecondary }]}>{suffix}</Text>
      )}
    </View>
  );
}

interface NumberedRowProps {
  num: number;
  label: string;
  colors: any;
  children: React.ReactNode;
  onPickPhoto?: () => void;
}

function NumberedRow({ num, label, colors, children, onPickPhoto }: NumberedRowProps) {
  return (
    <View
      style={[styles.numberedCard, { backgroundColor: colors.cardBg, shadowColor: colors.textPrimary }]}
    >
      <View style={styles.numberedHeader}>
        <View style={[styles.numBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.numBadgeText}>{num}</Text>
        </View>
        <Text style={[styles.numberedLabel, { color: colors.textPrimary }]}>{label}</Text>
        {onPickPhoto && (
          <TouchableOpacity
            style={[styles.cameraBtn, { borderColor: colors.border }]}
            onPress={onPickPhoto}
          >
            <Ionicons name="camera-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.numberedContent}>{children}</View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeSurveyFormScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [page, setPage] = useState(1); // 1–4
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Shared photos array
  const [photos, setPhotos] = useState<string[]>([]);

  // ── Page 1 — Customer Info ────────────────────────────────────────────────
  const [vsoNo, setVsoNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerTel, setCustomerTel] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [propertyType, setPropertyType] = useState('');
  const [carModel, setCarModel] = useState('');

  // ── Page 2 — Electrical Assessment ───────────────────────────────────────
  const [tnbPhase, setTnbPhase] = useState('');
  const [tnbSpecify, setTnbSpecify] = useState('');
  const [currentRed, setCurrentRed] = useState('');
  const [currentYellow, setCurrentYellow] = useState('');
  const [currentBlue, setCurrentBlue] = useState('');
  const [currentLive, setCurrentLive] = useState('');
  const [dbMcb, setDbMcb] = useState('');
  const [dbMccb, setDbMccb] = useState('');
  const [dbRccb, setDbRccb] = useState('');
  const [breakerType, setBreakerType] = useState('');
  const [breakerRating, setBreakerRating] = useState('');
  const [breakerPole, setBreakerPole] = useState('');
  const [v1Red, setV1Red] = useState('');
  const [v1Yellow, setV1Yellow] = useState('');
  const [v1Blue, setV1Blue] = useState('');
  const [v3RY, setV3RY] = useState('');
  const [v3RB, setV3RB] = useState('');
  const [v3YB, setV3YB] = useState('');
  const [cableInspection, setCableInspection] = useState('');
  const [cableInspectionSpecify, setCableInspectionSpecify] = useState('');
  const [dbLayout, setDbLayout] = useState('');
  const [dbLayoutSpecify, setDbLayoutSpecify] = useState('');
  const [loadRed, setLoadRed] = useState('');
  const [loadYellow, setLoadYellow] = useState('');
  const [loadBlue, setLoadBlue] = useState('');
  const [balRed, setBalRed] = useState('');
  const [balYellow, setBalYellow] = useState('');
  const [balBlue, setBalBlue] = useState('');

  // ── Page 3 — Site Details ─────────────────────────────────────────────────
  const [installProceed, setInstallProceed] = useState<YesNoNull>(null);
  const [installProceedSpecify, setInstallProceedSpecify] = useState('');
  const [cableLengthDb, setCableLengthDb] = useState('');
  const [chargerLocation, setChargerLocation] = useState('');
  const [isolator, setIsolator] = useState<YesNoNull>(null);
  const [isolatorSpecify, setIsolatorSpecify] = useState('');
  const [trunkConceal, setTrunkConceal] = useState<YesNoNull>(null);
  const [trunkConcealSpecify, setTrunkConcealSpecify] = useState('');
  const [hackHole, setHackHole] = useState<YesNoNull>(null);
  const [hackHoleSpecify, setHackHoleSpecify] = useState('');
  const [plasterCeiling, setPlasterCeiling] = useState<YesNoNull>(null);
  const [plasterCeilingSpecify, setPlasterCeilingSpecify] = useState('');
  const [workPermit, setWorkPermit] = useState<YesNoNull>(null);
  const [workPermitSpecify, setWorkPermitSpecify] = useState('');
  const [earthWiring, setEarthWiring] = useState<string[]>([]);
  const [chargerModel, setChargerModel] = useState('');
  const [chargingCableLength, setChargingCableLength] = useState('5');
  const [chargerHolder, setChargerHolder] = useState<YesNoNull>(null);
  const [installApptDate, setInstallApptDate] = useState(new Date());
  const [remarks, setRemarks] = useState('');

  // ── Page 4 — Outcome ──────────────────────────────────────────────────────
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [cZeroSignature, setCZeroSignature] = useState('');
  const [customerSignature, setCustomerSignature] = useState('');

  // ── Date picker modal state ────────────────────────────────────────────────
  const [showApptModal, setShowApptModal] = useState(false);
  const [showInstallApptModal, setShowInstallApptModal] = useState(false);
  const [apptPickerMode, setApptPickerMode] = useState<'date' | 'time'>('date');
  const [showApptPicker, setShowApptPicker] = useState(false);
  const [installApptPickerMode, setInstallApptPickerMode] = useState<'date' | 'time'>('date');
  const [showInstallApptPicker, setShowInstallApptPicker] = useState(false);

  // ── Pre-fill ──────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getInstallation(jobId);
        setCustomerName(data.customer?.name ?? '');
        setCustomerTel(data.customer?.phone ?? '');
        const addr = [
          data.customer?.address?.street,
          data.customer?.address?.city,
          data.customer?.address?.state,
        ]
          .filter(Boolean)
          .join(', ');
        setCustomerAddress(addr);
        setVsoNo(data.customer?.vsoNumber ?? '');
        const surveyDate = data.scheduling?.survey_scheduled_date;
        if (surveyDate) {
          const d = new Date(surveyDate);
          if (!isNaN(d.getTime())) setAppointmentDate(d);
        }
      } catch {
        // silently ignore — fields stay empty
      } finally {
        setLoading(false);
      }
    })();
    if (user?.name) setTechnicianName(user.name);
  }, [jobId]);

  // ── Photo helpers ─────────────────────────────────────────────────────────
  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to upload photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  }

  function removePhoto(uri: string) {
    setPhotos((prev) => prev.filter((p) => p !== uri));
  }

  // ── Date helpers ──────────────────────────────────────────────────────────
  function formatDisplayDate(d: Date): string {
    return d.toLocaleDateString('en-MY', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatDisplayTime(d: Date): string {
    return d.toLocaleTimeString('en-MY', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  function formatDateISO(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  function formatTimeHHMM(d: Date): string {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // ── Date picker handlers ──────────────────────────────────────────────────
  function handleApptPickerChange(_event: any, date?: Date) {
    if (!date) { setShowApptPicker(false); return; }
    const updated = new Date(appointmentDate);
    if (apptPickerMode === 'date') {
      updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setAppointmentDate(updated);
      setShowApptPicker(false);
      if (Platform.OS === 'android') {
        setTimeout(() => { setApptPickerMode('time'); setShowApptPicker(true); }, 100);
      }
    } else {
      updated.setHours(date.getHours(), date.getMinutes());
      setAppointmentDate(updated);
      setShowApptPicker(false);
    }
  }

  function handleInstallApptPickerChange(_event: any, date?: Date) {
    if (!date) { setShowInstallApptPicker(false); return; }
    const updated = new Date(installApptDate);
    if (installApptPickerMode === 'date') {
      updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setInstallApptDate(updated);
      setShowInstallApptPicker(false);
      if (Platform.OS === 'android') {
        setTimeout(() => { setInstallApptPickerMode('time'); setShowInstallApptPicker(true); }, 100);
      }
    } else {
      updated.setHours(date.getHours(), date.getMinutes());
      setInstallApptDate(updated);
      setShowInstallApptPicker(false);
    }
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  function handleBack() {
    if (page > 1) {
      setPage((p) => p - 1);
    } else {
      navigation.goBack();
    }
  }

  function handleNext() {
    setPage((p) => Math.min(p + 1, 4));
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!outcome) {
      Alert.alert('Required', 'Please select an outcome before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      for (const uri of photos) {
        await uploadDocument(jobId, uri, 'home_survey');
      }

      const surveyData = {
        page1: {
          vsoNo,
          customerName,
          customerTel,
          customerAddress,
          technicianName,
          appointmentDate: formatDateISO(appointmentDate),
          appointmentTime: formatTimeHHMM(appointmentDate),
          propertyType,
          carModel,
        },
        page2: {
          tnbPhase,
          tnbSpecify,
          currentMeter: { red: currentRed, yellow: currentYellow, blue: currentBlue, live: currentLive },
          dbPanel: { mcb: dbMcb, mccb: dbMccb, rccb: dbRccb },
          incomingBreaker: { type: breakerType, rating: breakerRating, pole: breakerPole },
          voltage1Phase: { red: v1Red, yellow: v1Yellow, blue: v1Blue },
          voltage3Phase: { ry: v3RY, rb: v3RB, yb: v3YB },
          cableInspection,
          cableInspectionSpecify,
          dbLayout,
          dbLayoutSpecify,
          fullLoadTest: { red: loadRed, yellow: loadYellow, blue: loadBlue },
          balanceLoad: { red: balRed, yellow: balYellow, blue: balBlue },
        },
        page3: {
          installProceed,
          installProceedSpecify,
          cableLengthDb,
          chargerLocation,
          isolator,
          isolatorSpecify,
          trunkConceal,
          trunkConcealSpecify,
          hackHole,
          hackHoleSpecify,
          plasterCeiling,
          plasterCeilingSpecify,
          workPermit,
          workPermitSpecify,
          earthWiring,
          chargerModel,
          chargingCableLength,
          chargerHolder,
          installApptDate: formatDateISO(installApptDate),
          installApptTime: formatTimeHHMM(installApptDate),
          remarks,
        },
        page4: {
          outcome,
          photosCount: photos.length,
          cZeroRepName: toTitleCase(technicianName),
          cZeroRepDate: formatDateISO(new Date()),
          customerAckName: toTitleCase(customerName),
          customerAckDate: formatDateISO(new Date()),
          cZeroSignature,
          customerSignature,
        },
      };

      await putInstallation(jobId, {
        notes: [`home_check_survey:${JSON.stringify(surveyData)}`],
      });

      const nextStatus =
        outcome === 'approved'
          ? ('approved-for-installation' as const)
          : ('on-hold' as const);
      await updateStatus(jobId, nextStatus);

      Alert.alert(
        'Survey Submitted',
        outcome === 'approved'
          ? 'Home survey completed. Job is approved for installation.'
          : 'Home survey completed. Job is placed on hold.',
        [{ text: 'Done', onPress: () => navigation.pop(2) }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Page renderers ────────────────────────────────────────────────────────

  function renderPage1() {
    return (
      <>
        <SectionHeader label="CUSTOMER INFORMATION" colors={colors} />

        <FieldCard label="VSO No" colors={colors}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
            value={vsoNo}
            onChangeText={setVsoNo}
            placeholder="e.g. VSO-2024-001"
            placeholderTextColor={colors.textMuted}
          />
        </FieldCard>

        <FieldCard label="Customer Name" colors={colors}>
          <TextInput
            style={[
              styles.input,
              { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background },
            ]}
            value={toTitleCase(customerName)}
            editable={false}
            selectTextOnFocus={false}
          />
        </FieldCard>

        <FieldCard label="No Tel" colors={colors}>
          <TextInput
            style={[
              styles.input,
              { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background },
            ]}
            value={customerTel}
            editable={false}
            selectTextOnFocus={false}
          />
        </FieldCard>

        <FieldCard label="Customer Address" colors={colors}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.background,
                height: 60,
              },
            ]}
            value={customerAddress}
            editable={false}
            selectTextOnFocus={false}
            multiline
          />
        </FieldCard>

        <FieldCard label="Homecheck Technician" colors={colors}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
            value={technicianName}
            onChangeText={setTechnicianName}
            placeholder="Technician name"
            placeholderTextColor={colors.textMuted}
          />
        </FieldCard>

        <FieldCard label="Appointment" colors={colors}>
          <TouchableOpacity
            style={[styles.dateRow, { borderColor: colors.border }]}
            onPress={() => {
              setApptPickerMode('date');
              setShowApptPicker(false);
              setShowApptModal(true);
            }}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={[styles.dateValue, { color: colors.textPrimary }]}>
              {formatDisplayDate(appointmentDate)} {formatDisplayTime(appointmentDate)}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </FieldCard>

        <FieldCard label="Property Type" colors={colors}>
          <RadioGroup
            options={['Landed', 'Strata', 'Condominium', 'Guarded']}
            value={propertyType}
            onChange={setPropertyType}
            colors={colors}
          />
        </FieldCard>

        <FieldCard label="Car Model" colors={colors}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
            value={carModel}
            onChangeText={setCarModel}
            placeholder="e.g. Tesla Model 3"
            placeholderTextColor={colors.textMuted}
          />
        </FieldCard>
      </>
    );
  }

  function renderPage2() {
    return (
      <>
        <SectionHeader label="ELECTRICAL ASSESSMENT" colors={colors} />

        <NumberedRow num={1} label="TNB Meter Specification" colors={colors} onPickPhoto={takePhoto}>
          <RadioGroup
            options={['1 Phase', '3 Phase']}
            value={tnbPhase}
            onChange={setTnbPhase}
            colors={colors}
          />
          <TextInput
            style={[styles.input, styles.inputMt, { color: colors.textPrimary, borderColor: colors.border }]}
            value={tnbSpecify}
            onChangeText={setTnbSpecify}
            placeholder="Specify..."
            placeholderTextColor={colors.textMuted}
          />
        </NumberedRow>

        <NumberedRow num={2} label="Current at Meter (Amp)" colors={colors} onPickPhoto={takePhoto}>
          <View style={styles.multiInputRow}>
            {(
              [
                { label: 'Red', value: currentRed, set: setCurrentRed },
                { label: 'Yellow', value: currentYellow, set: setCurrentYellow },
                { label: 'Blue', value: currentBlue, set: setCurrentBlue },
                { label: 'Live', value: currentLive, set: setCurrentLive },
              ] as const
            ).map(({ label, value, set }) => (
              <View key={label} style={styles.miniInputWrap}>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>{label}</Text>
                <TextInput
                  style={[styles.miniInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  value={value}
                  onChangeText={set}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ))}
          </View>
        </NumberedRow>

        <NumberedRow num={3} label="Qty of DB Panel" colors={colors} onPickPhoto={takePhoto}>
          <View style={styles.multiInputRow}>
            {(
              [
                { label: 'MCB', value: dbMcb, set: setDbMcb },
                { label: 'MCCB', value: dbMccb, set: setDbMccb },
                { label: 'RCCB', value: dbRccb, set: setDbRccb },
              ] as const
            ).map(({ label, value, set }) => (
              <View key={label} style={styles.miniInputWrap}>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>{label}</Text>
                <TextInput
                  style={[styles.miniInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  value={value}
                  onChangeText={set}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ))}
          </View>
        </NumberedRow>

        <NumberedRow num={4} label="Incoming Breaker Spec" colors={colors} onPickPhoto={takePhoto}>
          <View style={styles.multiInputRow}>
            {(
              [
                { label: 'Type', value: breakerType, set: setBreakerType, kb: 'default' as const },
                { label: 'Rating (A)', value: breakerRating, set: setBreakerRating, kb: 'numeric' as const },
                { label: 'Pole', value: breakerPole, set: setBreakerPole, kb: 'default' as const },
              ] as const
            ).map(({ label, value, set, kb }) => (
              <View key={label} style={styles.miniInputWrap}>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>{label}</Text>
                <TextInput
                  style={[styles.miniInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  value={value}
                  onChangeText={set}
                  keyboardType={kb}
                  placeholder="—"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ))}
          </View>
        </NumberedRow>

        <NumberedRow num={5} label="Voltage 1 Phase (V)" colors={colors} onPickPhoto={takePhoto}>
          <View style={styles.multiInputRow}>
            {(
              [
                { label: 'Red', value: v1Red, set: setV1Red },
                { label: 'Yellow', value: v1Yellow, set: setV1Yellow },
                { label: 'Blue', value: v1Blue, set: setV1Blue },
              ] as const
            ).map(({ label, value, set }) => (
              <View key={label} style={styles.miniInputWrap}>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>{label}</Text>
                <TextInput
                  style={[styles.miniInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  value={value}
                  onChangeText={set}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ))}
          </View>
        </NumberedRow>

        <NumberedRow num={6} label="Voltage 3 Phase (V)" colors={colors} onPickPhoto={takePhoto}>
          <View style={styles.multiInputRow}>
            {(
              [
                { label: 'R/Y', value: v3RY, set: setV3RY },
                { label: 'R/B', value: v3RB, set: setV3RB },
                { label: 'Y/B', value: v3YB, set: setV3YB },
              ] as const
            ).map(({ label, value, set }) => (
              <View key={label} style={styles.miniInputWrap}>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>{label}</Text>
                <TextInput
                  style={[styles.miniInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  value={value}
                  onChangeText={set}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ))}
          </View>
        </NumberedRow>

        <NumberedRow num={7} label="Incoming Cable Inspection" colors={colors} onPickPhoto={takePhoto}>
          <RadioGroup
            options={['Good', 'Poor']}
            value={cableInspection}
            onChange={setCableInspection}
            colors={colors}
          />
          <TextInput
            style={[styles.input, styles.inputMt, { color: colors.textPrimary, borderColor: colors.border }]}
            value={cableInspectionSpecify}
            onChangeText={setCableInspectionSpecify}
            placeholder="Specify if Poor..."
            placeholderTextColor={colors.textMuted}
          />
        </NumberedRow>

        <NumberedRow num={8} label="DB Internal Layout" colors={colors}>
          <RadioGroup
            options={['Good', 'Poor']}
            value={dbLayout}
            onChange={setDbLayout}
            colors={colors}
          />
          <TextInput
            style={[styles.input, styles.inputMt, { color: colors.textPrimary, borderColor: colors.border }]}
            value={dbLayoutSpecify}
            onChangeText={setDbLayoutSpecify}
            placeholder="Specify if Poor..."
            placeholderTextColor={colors.textMuted}
          />
        </NumberedRow>

        <NumberedRow num={9} label="Full Load Test (Amp)" colors={colors} onPickPhoto={takePhoto}>
          <View style={styles.multiInputRow}>
            {(
              [
                { label: 'Red', value: loadRed, set: setLoadRed },
                { label: 'Yellow', value: loadYellow, set: setLoadYellow },
                { label: 'Blue', value: loadBlue, set: setLoadBlue },
              ] as const
            ).map(({ label, value, set }) => (
              <View key={label} style={styles.miniInputWrap}>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>{label}</Text>
                <TextInput
                  style={[styles.miniInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  value={value}
                  onChangeText={set}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ))}
          </View>
        </NumberedRow>

        <NumberedRow num={10} label="Balance Load (Amp)" colors={colors}>
          <View style={styles.multiInputRow}>
            {(
              [
                { label: 'Red', value: balRed, set: setBalRed },
                { label: 'Yellow', value: balYellow, set: setBalYellow },
                { label: 'Blue', value: balBlue, set: setBalBlue },
              ] as const
            ).map(({ label, value, set }) => (
              <View key={label} style={styles.miniInputWrap}>
                <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>{label}</Text>
                <TextInput
                  style={[styles.miniInput, { color: colors.textPrimary, borderColor: colors.border }]}
                  value={value}
                  onChangeText={set}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            ))}
          </View>
        </NumberedRow>
      </>
    );
  }

  function renderPage3() {
    return (
      <>
        <SectionHeader label="SITE DETAILS" colors={colors} />

        <NumberedRow num={11} label="Installation to Proceed?" colors={colors} onPickPhoto={takePhoto}>
          <RadioGroup
            options={['Yes', 'No']}
            value={installProceed === 'yes' ? 'Yes' : installProceed === 'no' ? 'No' : ''}
            onChange={(v) => setInstallProceed(v === 'Yes' ? 'yes' : 'no')}
            colors={colors}
          />
          <TextInput
            style={[styles.input, styles.inputMt, { color: colors.textPrimary, borderColor: colors.border }]}
            value={installProceedSpecify}
            onChangeText={setInstallProceedSpecify}
            placeholder="Specify if No..."
            placeholderTextColor={colors.textMuted}
          />
        </NumberedRow>

        <NumberedRow num={12} label="Cable Length from DB to EVSE" colors={colors}>
          <InlineInput
            value={cableLengthDb}
            onChange={setCableLengthDb}
            placeholder="0"
            keyboardType="numeric"
            colors={colors}
            suffix="meter"
          />
        </NumberedRow>

        <NumberedRow num={13} label="Reference Charger Location" colors={colors} onPickPhoto={takePhoto}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
            value={chargerLocation}
            onChangeText={setChargerLocation}
            placeholder="Describe location..."
            placeholderTextColor={colors.textMuted}
          />
        </NumberedRow>

        <NumberedRow num={14} label="Isolator 32A" colors={colors}>
          <RadioGroup
            options={['Yes', 'No']}
            value={isolator === 'yes' ? 'Yes' : isolator === 'no' ? 'No' : ''}
            onChange={(v) => setIsolator(v === 'Yes' ? 'yes' : 'no')}
            colors={colors}
          />
          <InlineInput
            value={isolatorSpecify}
            onChange={setIsolatorSpecify}
            placeholder="Qty"
            keyboardType="numeric"
            colors={colors}
            suffix="pcs"
          />
        </NumberedRow>

        <NumberedRow num={15} label="Trunk / Conceal (wiring incl)" colors={colors}>
          <RadioGroup
            options={['Yes', 'No']}
            value={trunkConceal === 'yes' ? 'Yes' : trunkConceal === 'no' ? 'No' : ''}
            onChange={(v) => setTrunkConceal(v === 'Yes' ? 'yes' : 'no')}
            colors={colors}
          />
          <InlineInput
            value={trunkConcealSpecify}
            onChange={setTrunkConcealSpecify}
            placeholder="Length"
            keyboardType="numeric"
            colors={colors}
            suffix="meter"
          />
        </NumberedRow>

        <NumberedRow num={16} label="Hack / Hole (back-to-back)" colors={colors}>
          <RadioGroup
            options={['Yes', 'No']}
            value={hackHole === 'yes' ? 'Yes' : hackHole === 'no' ? 'No' : ''}
            onChange={(v) => setHackHole(v === 'Yes' ? 'yes' : 'no')}
            colors={colors}
          />
          <InlineInput
            value={hackHoleSpecify}
            onChange={setHackHoleSpecify}
            placeholder="Qty"
            keyboardType="numeric"
            colors={colors}
            suffix="unit"
          />
        </NumberedRow>

        <NumberedRow num={17} label="Plaster Ceiling Opening" colors={colors}>
          <RadioGroup
            options={['Yes', 'No']}
            value={plasterCeiling === 'yes' ? 'Yes' : plasterCeiling === 'no' ? 'No' : ''}
            onChange={(v) => setPlasterCeiling(v === 'Yes' ? 'yes' : 'no')}
            colors={colors}
          />
          <InlineInput
            value={plasterCeilingSpecify}
            onChange={setPlasterCeilingSpecify}
            placeholder="Qty"
            keyboardType="numeric"
            colors={colors}
            suffix="unit"
          />
        </NumberedRow>

        <NumberedRow num={18} label="Work Permit Required" colors={colors}>
          <RadioGroup
            options={['Yes', 'No']}
            value={workPermit === 'yes' ? 'Yes' : workPermit === 'no' ? 'No' : ''}
            onChange={(v) => setWorkPermit(v === 'Yes' ? 'yes' : 'no')}
            colors={colors}
          />
          <TextInput
            style={[styles.input, styles.inputMt, { color: colors.textPrimary, borderColor: colors.border }]}
            value={workPermitSpecify}
            onChangeText={setWorkPermitSpecify}
            placeholder="Specify..."
            placeholderTextColor={colors.textMuted}
          />
        </NumberedRow>

        <NumberedRow num={19} label="Earth Wiring Condition" colors={colors}>
          <CheckboxGroup
            options={['OK', 'NG', 'New Earthing', 'SPD']}
            values={earthWiring}
            onChange={setEarthWiring}
            colors={colors}
          />
        </NumberedRow>

        <SectionHeader label="CHARGER DETAILS" colors={colors} />

        <FieldCard label="Recommended Charger Model" colors={colors}>
          <RadioGroup
            options={['AC Smart 7KW (1P)', 'AC Smart 22KW (3P)']}
            value={chargerModel}
            onChange={setChargerModel}
            colors={colors}
          />
        </FieldCard>

        <FieldCard label="Charging Cable Length" colors={colors}>
          <InlineInput
            value={chargingCableLength}
            onChange={setChargingCableLength}
            placeholder="5"
            keyboardType="numeric"
            colors={colors}
            suffix="meter"
          />
        </FieldCard>

        <FieldCard label="Charger Holder Required" colors={colors}>
          <RadioGroup
            options={['Yes', 'No']}
            value={chargerHolder === 'yes' ? 'Yes' : chargerHolder === 'no' ? 'No' : ''}
            onChange={(v) => setChargerHolder(v === 'Yes' ? 'yes' : 'no')}
            colors={colors}
          />
        </FieldCard>

        <SectionHeader label="INSTALLATION APPOINTMENT" colors={colors} />

        <FieldCard label="Installation Appointment" colors={colors}>
          <TouchableOpacity
            style={[styles.dateRow, { borderColor: colors.border }]}
            onPress={() => {
              setInstallApptPickerMode('date');
              setShowInstallApptPicker(false);
              setShowInstallApptModal(true);
            }}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={[styles.dateValue, { color: colors.textPrimary }]}>
              {formatDisplayDate(installApptDate)} {formatDisplayTime(installApptDate)}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </FieldCard>

        <SectionHeader label="REMARKS" colors={colors} />
        <View style={[styles.notesCard, { backgroundColor: colors.cardBg, shadowColor: colors.textPrimary }]}>
          <View style={[styles.fieldCardAccent, { backgroundColor: colors.primary }]} />
          <View style={styles.fieldCardInner}>
            <TextInput
              style={[styles.notesInput, { color: colors.textPrimary }]}
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Additional remarks..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </>
    );
  }

  function renderPage4() {
    return (
      <>
        <SectionHeader label="SURVEY OUTCOME" colors={colors} />

        <View style={styles.outcomeRow}>
          <TouchableOpacity
            style={[
              styles.outcomeBtn,
              {
                borderColor: outcome === 'approved' ? '#2DC88A' : colors.border,
                backgroundColor: outcome === 'approved' ? '#E8FAF3' : colors.cardBg,
              },
            ]}
            onPress={() => setOutcome('approved')}
          >
            <Ionicons
              name="checkmark-circle"
              size={28}
              color={outcome === 'approved' ? '#2DC88A' : colors.textMuted}
            />
            <Text
              style={[
                styles.outcomeBtnText,
                { color: outcome === 'approved' ? '#2DC88A' : colors.textSecondary },
              ]}
            >
              {'Approved for\nInstallation'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.outcomeBtn,
              {
                borderColor: outcome === 'on-hold' ? '#F5A623' : colors.border,
                backgroundColor: outcome === 'on-hold' ? '#FFFBEB' : colors.cardBg,
              },
            ]}
            onPress={() => setOutcome('on-hold')}
          >
            <Ionicons
              name="pause-circle"
              size={28}
              color={outcome === 'on-hold' ? '#F5A623' : colors.textMuted}
            />
            <Text
              style={[
                styles.outcomeBtnText,
                { color: outcome === 'on-hold' ? '#F5A623' : colors.textSecondary },
              ]}
            >
              {'On Hold /\nCannot Proceed'}
            </Text>
          </TouchableOpacity>
        </View>

        <SectionHeader label="SITE PHOTOS" colors={colors} />
        <PhotoViewer
          photos={photos}
          onRemove={removePhoto}
          onCamera={takePhoto}
          onGallery={pickPhoto}
        />

        <SectionHeader label="ACKNOWLEDGEMENT" colors={colors} />

        <FieldCard label="C Zero Representative Signature" colors={colors}>
          <SignaturePad
            label="C Zero Representative"
            sublabel={toTitleCase(technicianName) || 'Technician'}
            value={cZeroSignature}
            onChange={setCZeroSignature}
          />
        </FieldCard>

        <FieldCard label="Customer Signature" colors={colors}>
          <SignaturePad
            label="Customer Signature"
            sublabel={toTitleCase(customerName) || 'Customer'}
            value={customerSignature}
            onChange={setCustomerSignature}
          />
        </FieldCard>

        <View style={[styles.ackBanner, { backgroundColor: colors.primaryLight, marginTop: 4 }]}>
          <Text style={[styles.ackText, { color: colors.primary }]}>
            I confirm that the home-check has been carried out according to the requirements specified.
            The customer has been advised of the EV charging requirements.
          </Text>
        </View>
      </>
    );
  }

  function renderCurrentPage() {
    switch (page) {
      case 1: return renderPage1();
      case 2: return renderPage2();
      case 3: return renderPage3();
      case 4: return renderPage4();
      default: return null;
    }
  }

  function pageTitle() {
    switch (page) {
      case 1: return 'Customer Info';
      case 2: return 'Electrical Assessment';
      case 3: return 'Site Details';
      case 4: return 'Outcome';
      default: return '';
    }
  }

  function nextPageLabel() {
    switch (page) {
      case 1: return 'Electrical Assessment';
      case 2: return 'Site Details';
      case 3: return 'Outcome';
      default: return '';
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const ctaBottomPadding = insets.bottom + 16;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View
        style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Home Survey</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{pageTitle()}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress bar — 4 segments */}
      <View
        style={[styles.progressContainer, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}
      >
        {[1, 2, 3, 4].map((p) => (
          <View
            key={p}
            style={[
              styles.progressSegment,
              { backgroundColor: p <= page ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>

      {/* Scroll content */}
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: ctaBottomPadding + 68 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderCurrentPage()}
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={[
          styles.ctaContainer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: ctaBottomPadding,
          },
        ]}
      >
        {page < 4 ? (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
            onPress={handleNext}
          >
            <Text style={styles.ctaBtnText}>Next: {nextPageLabel()}</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.ctaBtn,
              { backgroundColor: submitting ? colors.border : colors.primary },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.ctaBtnText}>Submit Survey</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Survey Appointment Modal */}
      <Modal
        visible={showApptModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowApptModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowApptModal(false)}>
          <Pressable
            style={[styles.scheduleSheet, { backgroundColor: colors.cardBg, paddingBottom: insets.bottom + 20 }]}
            onPress={() => {}}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.scheduleTitle, { color: colors.textPrimary }]}>Survey Appointment</Text>

            <TouchableOpacity
              style={[styles.datePickerRow, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => { setApptPickerMode('date'); setShowApptPicker(true); }}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View style={styles.datePickerText}>
                <Text style={[styles.scheduleLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Date</Text>
                <Text style={[styles.datePickerValue, { color: colors.textPrimary }]}>{formatDisplayDate(appointmentDate)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.datePickerRow, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => { setApptPickerMode('time'); setShowApptPicker(true); }}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={styles.datePickerText}>
                <Text style={[styles.scheduleLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Time</Text>
                <Text style={[styles.datePickerValue, { color: colors.textPrimary }]}>{formatDisplayTime(appointmentDate)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {showApptPicker && (
              <DateTimePicker
                value={appointmentDate}
                mode={apptPickerMode}
                display="default"
                onChange={handleApptPickerChange}
              />
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary, marginTop: Spacing.base }]}
              onPress={() => setShowApptModal(false)}
            >
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Installation Appointment Modal */}
      <Modal
        visible={showInstallApptModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInstallApptModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowInstallApptModal(false)}>
          <Pressable
            style={[styles.scheduleSheet, { backgroundColor: colors.cardBg, paddingBottom: insets.bottom + 20 }]}
            onPress={() => {}}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.scheduleTitle, { color: colors.textPrimary }]}>Installation Appointment</Text>

            <TouchableOpacity
              style={[styles.datePickerRow, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => { setInstallApptPickerMode('date'); setShowInstallApptPicker(true); }}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View style={styles.datePickerText}>
                <Text style={[styles.scheduleLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Date</Text>
                <Text style={[styles.datePickerValue, { color: colors.textPrimary }]}>{formatDisplayDate(installApptDate)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.datePickerRow, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => { setInstallApptPickerMode('time'); setShowInstallApptPicker(true); }}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={styles.datePickerText}>
                <Text style={[styles.scheduleLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Time</Text>
                <Text style={[styles.datePickerValue, { color: colors.textPrimary }]}>{formatDisplayTime(installApptDate)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {showInstallApptPicker && (
              <DateTimePicker
                value={installApptDate}
                mode={installApptPickerMode}
                display="default"
                onChange={handleInstallApptPickerChange}
              />
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary, marginTop: Spacing.base }]}
              onPress={() => setShowInstallApptModal(false)}
            >
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, width: 36 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSub: { fontSize: 11, marginTop: 2 },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: Spacing.base,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  progressSegment: { flex: 1, height: 4, borderRadius: 2 },
  scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    marginTop: Spacing.base,
  },
  fieldCard: {
    borderRadius: 14,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  fieldCardAccent: { width: 3 },
  fieldCardInner: { flex: 1, padding: 16 },
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  input: { height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  inputMt: { marginTop: 8 },
  radioRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  radioBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  checkboxBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  radioBtnText: { fontSize: 13, fontWeight: '600' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  dateValue: { flex: 1, fontSize: 14, fontWeight: '500' },
  numberedCard: {
    borderRadius: 14,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    padding: Spacing.md,
  },
  numberedHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  numBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  numberedLabel: { flex: 1, fontSize: 13, fontWeight: '700' },
  cameraBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberedContent: { gap: 6 },
  multiInputRow: { flexDirection: 'row', gap: 8 },
  miniInputWrap: { flex: 1 },
  miniLabel: { fontSize: 10, fontWeight: '600', marginBottom: 4 },
  miniInput: {
    height: 38,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 13,
    textAlign: 'center',
  },
  inlineInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inlineInput: { height: 42, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 14 },
  inputSuffix: { fontSize: 13, fontWeight: '600' },
  outcomeRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  outcomeBtn: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: 8,
  },
  outcomeBtnText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  ackBanner: { borderRadius: 10, padding: Spacing.md },
  ackText: { fontSize: 12, lineHeight: 18, fontWeight: '500' },
  notesCard: {
    borderRadius: 14,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  notesInput: { fontSize: 14, minHeight: 100 },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
    borderTopWidth: 1,
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
  // Modal styles
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
  confirmBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
