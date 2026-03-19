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
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { Spacing } from '../../../theme';
import SignaturePad from '../../../components/common/SignaturePad';
import PhotoViewer from '../../../components/common/PhotoViewer';
import { getInstallation, putInstallation, updateStatus, uploadDocument } from '../../../services/jobs.service';

type Props = NativeStackScreenProps<RootStackParamList, 'InstallationForm'>;
type YesNo = 'yes' | 'no' | null;
type TabId = 'info' | 'technical' | 'safety' | 'testing' | 'handover';

const TABS: { id: TabId; label: string }[] = [
  { id: 'info', label: 'Info' },
  { id: 'technical', label: 'Technical' },
  { id: 'safety', label: 'Safety' },
  { id: 'testing', label: 'Testing' },
  { id: 'handover', label: 'Handover' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionTitle({ label, colors }: { label: string; colors: any }) {
  return <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{label}</Text>;
}

function YesNoToggle({ value, onChange, colors }: { value: YesNo; onChange: (v: YesNo) => void; colors: any }) {
  return (
    <View style={styles.yesNoRow}>
      {(['yes', 'no'] as const).map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.yesNoBtn,
            {
              backgroundColor: value === opt ? colors.primary : colors.cardBg,
              borderColor: value === opt ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.yesNoBtnText, { color: value === opt ? '#fff' : colors.textSecondary }]}>
            {opt === 'yes' ? 'Yes' : 'No'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MultiOptionToggle({
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
    <View style={styles.multiOptionRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          style={[
            styles.multiOptionBtn,
            {
              backgroundColor: value === opt ? colors.primary : colors.cardBg,
              borderColor: value === opt ? colors.primary : colors.border,
            },
          ]}
          onPress={() => onChange(opt)}
        >
          <Text style={[styles.multiOptionBtnText, { color: value === opt ? '#fff' : colors.textSecondary }]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function FieldCard({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
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

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function InstallationFormScreen({ route, navigation }: Props) {
  const { jobId } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabId>('info');
  const [submitting, setSubmitting] = useState(false);
  const [loadingInstallation, setLoadingInstallation] = useState(true);

  // ─── Tab 1: Info ─────────────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState('');
  const [infoDate, setInfoDate] = useState(new Date());
  const [vsoNo, setVsoNo] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [instDate, setInstDate] = useState(new Date());
  const [installerName, setInstallerName] = useState('');
  const [chargerPileId, setChargerPileId] = useState('');

  // ─── Tab 2: Technical ────────────────────────────────────────────────────
  const [powerRating, setPowerRating] = useState('');
  const [chargingCableLength, setChargingCableLength] = useState('');
  const [mountingType, setMountingType] = useState('');
  const [supplyType, setSupplyType] = useState('');
  const [incomingVoltage, setIncomingVoltage] = useState('');
  const [breakerType, setBreakerType] = useState('');
  const [breakerRating, setBreakerRating] = useState('');
  const [cableLength, setCableLength] = useState('');
  const [cableSizeType, setCableSizeType] = useState('');

  // ─── Tab 3: Safety ───────────────────────────────────────────────────────
  const [rccbTestResult, setRccbTestResult] = useState<YesNo>(null);
  const [earthingResistance, setEarthingResistance] = useState('');
  const [isolatorInstalled, setIsolatorInstalled] = useState<YesNo>(null);
  const [spdInstalled, setSpdInstalled] = useState<YesNo>(null);
  const [trunkingConceal, setTrunkingConceal] = useState<YesNo>(null);
  const [ceilingOpening, setCeilingOpening] = useState<YesNo>(null);
  const [hackingDrilling, setHackingDrilling] = useState<YesNo>(null);
  const [additionalDbWork, setAdditionalDbWork] = useState<YesNo>(null);

  // ─── Tab 4: Testing ──────────────────────────────────────────────────────
  const [powerOnTest, setPowerOnTest] = useState<YesNo>(null);
  const [chargingTest, setChargingTest] = useState<YesNo>(null);
  const [ledDisplayStatus, setLedDisplayStatus] = useState('');
  const [appCommSetup, setAppCommSetup] = useState<YesNo>(null);
  const [faultErrorCode, setFaultErrorCode] = useState('');
  const [testingPhotos, setTestingPhotos] = useState<string[]>([]);

  // ─── Tab 5: Handover ─────────────────────────────────────────────────────
  const [operationExplained, setOperationExplained] = useState<YesNo>(null);
  const [safetyBriefing, setSafetyBriefing] = useState<YesNo>(null);
  const [userManualProvided, setUserManualProvided] = useState<YesNo>(null);
  const [warrantyExplained, setWarrantyExplained] = useState<YesNo>(null);
  const [remarks, setRemarks] = useState('');
  const [clientSignature, setClientSignature] = useState('');
  const [installerSignature, setInstallerSignature] = useState('');

  // ─── Date picker modal state ──────────────────────────────────────────────
  const [showInfoDateModal, setShowInfoDateModal] = useState(false);
  const [showInstDateModal, setShowInstDateModal] = useState(false);
  const [infoDatePickerMode, setInfoDatePickerMode] = useState<'date' | 'time'>('date');
  const [showInfoDatePicker, setShowInfoDatePicker] = useState(false);
  const [instDatePickerMode, setInstDatePickerMode] = useState<'date' | 'time'>('date');
  const [showInstDatePicker, setShowInstDatePicker] = useState(false);

  // ─── Fetch installation on mount to pre-fill ─────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await getInstallation(jobId);
        setCustomerName(data.customer?.name ?? '');
        setVsoNo(data.customer?.vsoNumber ?? '');
        setContactNo(data.customer?.phone ?? '');
        const schedDate = data.scheduling?.installation_scheduled_date;
        if (schedDate) {
          const d = new Date(schedDate);
          if (!isNaN(d.getTime())) setInstDate(d);
        }
        const schedTime = data.scheduling?.installation_scheduled_time;
        if (schedTime && schedDate) {
          const d = new Date(schedDate);
          const [h, m] = schedTime.split(':').map(Number);
          if (!isNaN(h) && !isNaN(m)) {
            d.setHours(h, m);
            setInstDate(d);
          }
        }
        setInstallerName(data.installer?.name ?? '');
      } catch {
        // silently ignore — fields stay empty
      } finally {
        setLoadingInstallation(false);
      }
    })();
  }, [jobId]);

  // ─── Date helpers ─────────────────────────────────────────────────────────
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

  // ─── Date picker handlers ─────────────────────────────────────────────────
  function handleInfoDatePickerChange(_event: any, date?: Date) {
    if (!date) { setShowInfoDatePicker(false); return; }
    const updated = new Date(infoDate);
    if (infoDatePickerMode === 'date') {
      updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setInfoDate(updated);
      setShowInfoDatePicker(false);
    } else {
      updated.setHours(date.getHours(), date.getMinutes());
      setInfoDate(updated);
      setShowInfoDatePicker(false);
    }
  }

  function handleInstDatePickerChange(_event: any, date?: Date) {
    if (!date) { setShowInstDatePicker(false); return; }
    const updated = new Date(instDate);
    if (instDatePickerMode === 'date') {
      updated.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      setInstDate(updated);
      setShowInstDatePicker(false);
      if (Platform.OS === 'android') {
        setTimeout(() => { setInstDatePickerMode('time'); setShowInstDatePicker(true); }, 100);
      }
    } else {
      updated.setHours(date.getHours(), date.getMinutes());
      setInstDate(updated);
      setShowInstDatePicker(false);
    }
  }

  // ─── Photo helpers ───────────────────────────────────────────────────────
  async function pickPhoto(setter: React.Dispatch<React.SetStateAction<string[]>>) {
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
      setter((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  }

  async function takePhoto(setter: React.Dispatch<React.SetStateAction<string[]>>) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setter((prev) => [...prev, result.assets[0].uri]);
    }
  }

  function removePhoto(setter: React.Dispatch<React.SetStateAction<string[]>>, uri: string) {
    setter((prev) => prev.filter((p) => p !== uri));
  }

  // ─── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!customerName.trim() || !chargerPileId.trim() || !powerRating.trim() || !clientSignature) {
      Alert.alert(
        'Incomplete',
        'Please fill in all required fields: Customer Name, Charger Pile ID, Power Rating, and Client Signature.'
      );
      return;
    }
    setSubmitting(true);
    try {
      for (const uri of testingPhotos) {
        await uploadDocument(jobId, uri, 'photo');
      }

      const handoverData = {
        info: {
          customerName,
          date: formatDateISO(infoDate),
          vsoNo,
          contactNo,
          installationDate: formatDateISO(instDate),
          installationTime: formatTimeHHMM(instDate),
          installerName,
          chargerPileId,
        },
        technical: {
          powerRating,
          chargingCableLength,
          mountingType,
          supplyType,
          incomingVoltage,
          breakerType,
          breakerRating,
          cableLength,
          cableSizeType,
        },
        safety: {
          rccbTestResult: rccbTestResult === 'yes',
          earthingResistance,
          isolatorInstalled: isolatorInstalled === 'yes',
          spdInstalled: spdInstalled === 'yes',
          trunkingConceal: trunkingConceal === 'yes',
          ceilingOpening: ceilingOpening === 'yes',
          hackingDrilling: hackingDrilling === 'yes',
          additionalDbWork: additionalDbWork === 'yes',
        },
        testing: {
          powerOnTest: powerOnTest === 'yes',
          chargingTest: chargingTest === 'yes',
          ledDisplayStatus,
          appCommSetup: appCommSetup === 'yes',
          faultErrorCode,
          photosCount: testingPhotos.length,
        },
        handover: {
          operationExplained: operationExplained === 'yes',
          safetyBriefing: safetyBriefing === 'yes',
          userManualProvided: userManualProvided === 'yes',
          warrantyExplained: warrantyExplained === 'yes',
          remarks,
          clientSignature,
          installerSignature,
          installerDate: new Date().toISOString().slice(0, 10),
        },
      };

      await putInstallation(jobId, {
        notes: [`handover_agreement:${JSON.stringify(handoverData)}`],
      });
      await updateStatus(jobId, 'completed');

      Alert.alert(
        'Installation Complete',
        'The installation and handover have been submitted successfully. This job is now marked as completed.',
        [{ text: 'Done', onPress: () => navigation.pop(2) }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function goToNextTab() {
    const idx = TABS.findIndex((t) => t.id === tab);
    if (idx < TABS.length - 1) {
      setTab(TABS[idx + 1].id);
    }
  }

  // ─── Tab content ─────────────────────────────────────────────────────────
  function renderTabContent() {
    switch (tab) {
      case 'info':
        return (
          <>
            <SectionTitle label="JOB INFORMATION" colors={colors} />

            <FieldCard label="Customer Name *" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Customer full name"
                placeholderTextColor={colors.textMuted}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </FieldCard>

            <FieldCard label="Date" colors={colors}>
              <TouchableOpacity
                style={[styles.dateRow, { borderColor: colors.border }]}
                onPress={() => {
                  setInfoDatePickerMode('date');
                  setShowInfoDatePicker(false);
                  setShowInfoDateModal(true);
                }}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={[styles.dateValue, { color: colors.textPrimary }]}>{formatDisplayDate(infoDate)}</Text>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </FieldCard>

            <FieldCard label="VSO Number" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. VSO-2024-001"
                placeholderTextColor={colors.textMuted}
                value={vsoNo}
                onChangeText={setVsoNo}
              />
            </FieldCard>

            <FieldCard label="Contact Number" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="+60 12-345 6789"
                placeholderTextColor={colors.textMuted}
                value={contactNo}
                onChangeText={setContactNo}
                keyboardType="phone-pad"
              />
            </FieldCard>

            <FieldCard label="Installation Date & Time" colors={colors}>
              <TouchableOpacity
                style={[styles.dateRow, { borderColor: colors.border }]}
                onPress={() => {
                  setInstDatePickerMode('date');
                  setShowInstDatePicker(false);
                  setShowInstDateModal(true);
                }}
              >
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={[styles.dateValue, { color: colors.textPrimary }]}>
                  {formatDisplayDate(instDate)} {formatDisplayTime(instDate)}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </FieldCard>

            <FieldCard label="Installer Name" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="Technician full name"
                placeholderTextColor={colors.textMuted}
                value={installerName}
                onChangeText={setInstallerName}
              />
            </FieldCard>

            <FieldCard label="Charger Pile ID *" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. WB-2024-00123"
                placeholderTextColor={colors.textMuted}
                value={chargerPileId}
                onChangeText={setChargerPileId}
              />
            </FieldCard>

            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={goToNextTab}>
              <Text style={styles.nextBtnText}>Next: Technical</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </>
        );

      case 'technical':
        return (
          <>
            <SectionTitle label="CHARGER SPECIFICATIONS" colors={colors} />

            <FieldCard label="Power Rating *" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. 7.4kW"
                placeholderTextColor={colors.textMuted}
                value={powerRating}
                onChangeText={setPowerRating}
              />
            </FieldCard>

            <FieldCard label="Charging Cable Length" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. 5m"
                placeholderTextColor={colors.textMuted}
                value={chargingCableLength}
                onChangeText={setChargingCableLength}
              />
            </FieldCard>

            <FieldCard label="Mounting Type" colors={colors}>
              <MultiOptionToggle
                options={['Wall Mounted', 'Pedestal', 'Floor Mounted']}
                value={mountingType}
                onChange={setMountingType}
                colors={colors}
              />
            </FieldCard>

            <FieldCard label="Supply Type" colors={colors}>
              <MultiOptionToggle
                options={['Single Phase', 'Three Phase']}
                value={supplyType}
                onChange={setSupplyType}
                colors={colors}
              />
            </FieldCard>

            <SectionTitle label="ELECTRICAL DETAILS" colors={colors} />

            <FieldCard label="Incoming Voltage" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. 240V"
                placeholderTextColor={colors.textMuted}
                value={incomingVoltage}
                onChangeText={setIncomingVoltage}
              />
            </FieldCard>

            <FieldCard label="Breaker Type" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. MCB, RCCB"
                placeholderTextColor={colors.textMuted}
                value={breakerType}
                onChangeText={setBreakerType}
              />
            </FieldCard>

            <FieldCard label="Breaker Rating" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. 32A"
                placeholderTextColor={colors.textMuted}
                value={breakerRating}
                onChangeText={setBreakerRating}
              />
            </FieldCard>

            <FieldCard label="Cable Length" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. 10m"
                placeholderTextColor={colors.textMuted}
                value={cableLength}
                onChangeText={setCableLength}
              />
            </FieldCard>

            <FieldCard label="Cable Size / Type" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. 6mm²"
                placeholderTextColor={colors.textMuted}
                value={cableSizeType}
                onChangeText={setCableSizeType}
              />
            </FieldCard>

            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={goToNextTab}>
              <Text style={styles.nextBtnText}>Next: Safety</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </>
        );

      case 'safety':
        return (
          <>
            <SectionTitle label="SAFETY CHECKS" colors={colors} />

            <FieldCard label="RCCB Test Result" colors={colors}>
              <YesNoToggle value={rccbTestResult} onChange={setRccbTestResult} colors={colors} />
            </FieldCard>

            <FieldCard label="Earthing Resistance" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. 0.5Ω"
                placeholderTextColor={colors.textMuted}
                value={earthingResistance}
                onChangeText={setEarthingResistance}
              />
            </FieldCard>

            <FieldCard label="Isolator Installed?" colors={colors}>
              <YesNoToggle value={isolatorInstalled} onChange={setIsolatorInstalled} colors={colors} />
            </FieldCard>

            <FieldCard label="SPD Installed?" colors={colors}>
              <YesNoToggle value={spdInstalled} onChange={setSpdInstalled} colors={colors} />
            </FieldCard>

            <SectionTitle label="INSTALLATION REQUIREMENTS" colors={colors} />

            <FieldCard label="Trunking / Concealed wiring?" colors={colors}>
              <YesNoToggle value={trunkingConceal} onChange={setTrunkingConceal} colors={colors} />
            </FieldCard>

            <FieldCard label="Ceiling opening required?" colors={colors}>
              <YesNoToggle value={ceilingOpening} onChange={setCeilingOpening} colors={colors} />
            </FieldCard>

            <FieldCard label="Hacking / Drilling required?" colors={colors}>
              <YesNoToggle value={hackingDrilling} onChange={setHackingDrilling} colors={colors} />
            </FieldCard>

            <FieldCard label="Additional DB work required?" colors={colors}>
              <YesNoToggle value={additionalDbWork} onChange={setAdditionalDbWork} colors={colors} />
            </FieldCard>

            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={goToNextTab}>
              <Text style={styles.nextBtnText}>Next: Testing</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </>
        );

      case 'testing':
        return (
          <>
            <SectionTitle label="FUNCTIONAL TESTING" colors={colors} />

            <FieldCard label="Power On Test" colors={colors}>
              <YesNoToggle value={powerOnTest} onChange={setPowerOnTest} colors={colors} />
            </FieldCard>

            <FieldCard label="Charging Test" colors={colors}>
              <YesNoToggle value={chargingTest} onChange={setChargingTest} colors={colors} />
            </FieldCard>

            <FieldCard label="LED Display Status" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. All green"
                placeholderTextColor={colors.textMuted}
                value={ledDisplayStatus}
                onChangeText={setLedDisplayStatus}
              />
            </FieldCard>

            <FieldCard label="App / Comm setup done?" colors={colors}>
              <YesNoToggle value={appCommSetup} onChange={setAppCommSetup} colors={colors} />
            </FieldCard>

            <FieldCard label="Fault / Error Code (if any)" colors={colors}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
                placeholder="e.g. None"
                placeholderTextColor={colors.textMuted}
                value={faultErrorCode}
                onChangeText={setFaultErrorCode}
              />
            </FieldCard>

            <SectionTitle label="TESTING PHOTOS" colors={colors} />
            <PhotoViewer
              photos={testingPhotos}
              onRemove={(uri) => removePhoto(setTestingPhotos, uri)}
              onCamera={() => takePhoto(setTestingPhotos)}
              onGallery={() => pickPhoto(setTestingPhotos)}
            />

            <TouchableOpacity style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={goToNextTab}>
              <Text style={styles.nextBtnText}>Next: Handover</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </>
        );

      case 'handover':
        return (
          <>
            <SectionTitle label="CLIENT HANDOVER CHECKS" colors={colors} />

            <FieldCard label="Operation explained to client?" colors={colors}>
              <YesNoToggle value={operationExplained} onChange={setOperationExplained} colors={colors} />
            </FieldCard>

            <FieldCard label="Safety briefing given?" colors={colors}>
              <YesNoToggle value={safetyBriefing} onChange={setSafetyBriefing} colors={colors} />
            </FieldCard>

            <FieldCard label="User manual provided?" colors={colors}>
              <YesNoToggle value={userManualProvided} onChange={setUserManualProvided} colors={colors} />
            </FieldCard>

            <FieldCard label="Warranty explained?" colors={colors}>
              <YesNoToggle value={warrantyExplained} onChange={setWarrantyExplained} colors={colors} />
            </FieldCard>

            <SectionTitle label="REMARKS" colors={colors} />
            <View style={[styles.notesCard, { backgroundColor: colors.cardBg, shadowColor: colors.textPrimary }]}>
              <View style={[styles.fieldCardAccent, { backgroundColor: colors.primary }]} />
              <View style={styles.fieldCardInner}>
                <TextInput
                  style={[styles.notesInput, { color: colors.textPrimary }]}
                  placeholder="Any remarks or follow-up actions..."
                  placeholderTextColor={colors.textMuted}
                  value={remarks}
                  onChangeText={setRemarks}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <SectionTitle label="CLIENT SIGNATURE *" colors={colors} />
            <SignaturePad
              label="Client Signature"
              sublabel={customerName || 'Client'}
              value={clientSignature}
              onChange={setClientSignature}
            />

            <SectionTitle label="INSTALLER SIGNATURE" colors={colors} />
            <SignaturePad
              label="Installer Signature"
              sublabel={installerName || 'Technician'}
              value={installerSignature}
              onChange={setInstallerSignature}
            />
          </>
        );
    }
  }

  if (loadingInstallation) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Installation</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Installation & Handover Form</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.cardBg, borderBottomColor: colors.border }]}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.tabBtn, tab === t.id && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.id)}
          >
            <Text style={[styles.tabLabel, { color: tab === t.id ? colors.primary : colors.textSecondary }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + (tab === 'handover' ? 100 : 24) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderTabContent()}
      </ScrollView>

      {/* Submit CTA — visible only on handover tab */}
      {tab === 'handover' && (
        <View
          style={[
            styles.ctaContainer,
            { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 },
          ]}
        >
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: submitting ? colors.border : colors.primary }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.ctaBtnText}>Complete & Submit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Info Date Modal (date only, no time row) */}
      <Modal
        visible={showInfoDateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInfoDateModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowInfoDateModal(false)}>
          <Pressable
            style={[styles.scheduleSheet, { backgroundColor: colors.cardBg, paddingBottom: insets.bottom + 20 }]}
            onPress={() => {}}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.scheduleTitle, { color: colors.textPrimary }]}>Select Date</Text>

            <TouchableOpacity
              style={[styles.datePickerRow, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => { setInfoDatePickerMode('date'); setShowInfoDatePicker(true); }}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View style={styles.datePickerText}>
                <Text style={[styles.scheduleLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Date</Text>
                <Text style={[styles.datePickerValue, { color: colors.textPrimary }]}>{formatDisplayDate(infoDate)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {showInfoDatePicker && (
              <DateTimePicker
                value={infoDate}
                mode={infoDatePickerMode}
                display="default"
                onChange={handleInfoDatePickerChange}
              />
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary, marginTop: Spacing.base }]}
              onPress={() => setShowInfoDateModal(false)}
            >
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Installation Date & Time Modal */}
      <Modal
        visible={showInstDateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInstDateModal(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowInstDateModal(false)}>
          <Pressable
            style={[styles.scheduleSheet, { backgroundColor: colors.cardBg, paddingBottom: insets.bottom + 20 }]}
            onPress={() => {}}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.scheduleTitle, { color: colors.textPrimary }]}>Installation Date & Time</Text>

            <TouchableOpacity
              style={[styles.datePickerRow, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => { setInstDatePickerMode('date'); setShowInstDatePicker(true); }}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <View style={styles.datePickerText}>
                <Text style={[styles.scheduleLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Date</Text>
                <Text style={[styles.datePickerValue, { color: colors.textPrimary }]}>{formatDisplayDate(instDate)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.datePickerRow, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => { setInstDatePickerMode('time'); setShowInstDatePicker(true); }}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <View style={styles.datePickerText}>
                <Text style={[styles.scheduleLabel, { color: colors.textSecondary, marginBottom: 0 }]}>Time</Text>
                <Text style={[styles.datePickerValue, { color: colors.textPrimary }]}>{formatDisplayTime(instDate)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>

            {showInstDatePicker && (
              <DateTimePicker
                value={instDate}
                mode={instDatePickerMode}
                display="default"
                onChange={handleInstDatePickerChange}
              />
            )}

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary, marginTop: Spacing.base }]}
              onPress={() => setShowInstDateModal(false)}
            >
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  headerSub: { fontSize: 12, textAlign: 'center', marginTop: 2 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tabBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: { fontSize: 11, fontWeight: '700' },
  scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },
  sectionTitle: {
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
  yesNoRow: { flexDirection: 'row', gap: 8 },
  yesNoBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesNoBtnText: { fontSize: 14, fontWeight: '700' },
  multiOptionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  multiOptionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  multiOptionBtnText: { fontSize: 13, fontWeight: '600' },
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
  nextBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    marginBottom: Spacing.base,
  },
  nextBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
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
