import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from '../../../navigation/types';
import { useTheme } from '../../../context/ThemeContext';
import { INVOICES, Invoice } from '../data/mock';
import { Spacing } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'InvoiceDetail'>;

function InfoCard({ children, colors }: { children: React.ReactNode; colors: any }) {
  return (
    <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function RowField({
  label,
  value,
  valueColor,
  colors,
}: {
  label: string;
  value: string;
  valueColor?: string;
  colors: any;
}) {
  return (
    <View style={styles.rowField}>
      <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: valueColor ?? colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

export default function InvoiceDetailScreen({ route, navigation }: Props) {
  const { invoiceId } = route.params;
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const invoice: Invoice = INVOICES.find((inv) => inv.id === invoiceId) ?? INVOICES[0];
  const isPaid = invoice.status === 'paid';

  function handleDownload() {
    Alert.alert('Download PDF', `Downloading ${invoice.invoiceId}.pdf...`);
  }

  function handleMarkPaid() {
    Alert.alert('Mark as Paid', 'Are you sure you want to mark this invoice as paid?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: () => Alert.alert('Done', 'Invoice marked as paid.') },
    ]);
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{invoice.invoiceId}</Text>
        <TouchableOpacity
          style={[styles.downloadBtn, { backgroundColor: colors.primaryLight }]}
          onPress={handleDownload}
        >
          <Ionicons name="download-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>TOTAL AMOUNT</Text>
              <Text style={[styles.heroAmount, { color: colors.textPrimary }]}>{invoice.amount}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isPaid ? colors.primaryLight : colors.alertYellowBg },
              ]}
            >
              <Ionicons
                name={isPaid ? 'checkmark-circle' : 'time-outline'}
                size={14}
                color={isPaid ? colors.primary : colors.alertYellow}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isPaid ? colors.primary : colors.alertYellow },
                ]}
              >
                {isPaid ? 'PAID' : 'PENDING'}
              </Text>
            </View>
          </View>

          <View style={[styles.heroDivider, { backgroundColor: colors.border }]} />

          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Text style={[styles.heroMetaLabel, { color: colors.textSecondary }]}>ISSUED</Text>
              <Text style={[styles.heroMetaValue, { color: colors.textPrimary }]}>{invoice.date}</Text>
            </View>
            <View style={[styles.heroMetaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroMetaItem}>
              <Text style={[styles.heroMetaLabel, { color: colors.textSecondary }]}>DUE</Text>
              <Text style={[styles.heroMetaValue, { color: isPaid ? colors.textPrimary : colors.alertYellow }]}>
                {invoice.dueDate}
              </Text>
            </View>
            <View style={[styles.heroMetaDivider, { backgroundColor: colors.border }]} />
            <View style={styles.heroMetaItem}>
              <Text style={[styles.heroMetaLabel, { color: colors.textSecondary }]}>TYPE</Text>
              <Text style={[styles.heroMetaValue, { color: colors.textPrimary }]}>{invoice.type}</Text>
            </View>
          </View>
        </View>

        {/* Job Reference */}
        <InfoCard colors={colors}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>JOB REFERENCE</Text>
          <View style={styles.jobRefRow}>
            <View style={[styles.jobRefIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="flash" size={16} color={colors.primary} />
            </View>
            <View style={styles.jobRefText}>
              <Text style={[styles.jobRefName, { color: colors.textPrimary }]}>{invoice.jobName}</Text>
              <Text style={[styles.jobRefId, { color: colors.textSecondary }]}>
                {invoice.jobRef} · {invoice.client}
              </Text>
            </View>
          </View>
        </InfoCard>

        {/* Line Items */}
        <InfoCard colors={colors}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>LINE ITEMS</Text>
          {invoice.lineItems.map((item, i) => (
            <View key={i}>
              <View style={styles.lineItemRow}>
                <Text style={[styles.lineItemLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.lineItemAmount, { color: colors.textPrimary }]}>{item.amount}</Text>
              </View>
              {i < invoice.lineItems.length - 1 && (
                <View style={[styles.itemDivider, { backgroundColor: colors.border }]} />
              )}
            </View>
          ))}

          <View style={[styles.totalSection, { borderTopColor: colors.border }]}>
            <RowField label="Subtotal" value={invoice.subtotal} colors={colors} />
            <RowField label="GST / Tax (10%)" value={invoice.tax} colors={colors} />
            <View style={[styles.grandTotalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.grandTotalLabel, { color: colors.textPrimary }]}>Total</Text>
              <Text style={[styles.grandTotalValue, { color: colors.primary }]}>{invoice.amount}</Text>
            </View>
          </View>
        </InfoCard>

        {/* Payment Info */}
        {isPaid && invoice.paymentMethod && (
          <InfoCard colors={colors}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PAYMENT DETAILS</Text>
            <RowField label="Method" value={invoice.paymentMethod} colors={colors} />
            {invoice.paidDate && (
              <RowField label="Paid On" value={invoice.paidDate} valueColor={colors.primary} colors={colors} />
            )}
          </InfoCard>
        )}
      </ScrollView>

      {/* CTA */}
      <View
        style={[
          styles.ctaContainer,
          { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 12 },
        ]}
      >
        {isPaid ? (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: colors.primaryLight }]}
            onPress={handleDownload}
          >
            <Ionicons name="download-outline" size={18} color={colors.primary} />
            <Text style={[styles.ctaBtnText, { color: colors.primary }]}>Download PDF</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.dualCTA}>
            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.primary }]}
              onPress={handleDownload}
            >
              <Ionicons name="download-outline" size={16} color={colors.primary} />
              <Text style={[styles.outlineBtnText, { color: colors.primary }]}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ctaBtn, { flex: 2, backgroundColor: colors.primary }]}
              onPress={handleMarkPaid}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={[styles.ctaBtnText, { color: '#fff' }]}>Mark as Paid</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: { paddingHorizontal: Spacing.base, paddingTop: Spacing.base },

  // Hero
  heroCard: {
    borderRadius: 16,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  heroLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  heroAmount: { fontSize: 32, fontWeight: '800' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  heroDivider: { height: 1, marginBottom: Spacing.md },
  heroMeta: { flexDirection: 'row', alignItems: 'center' },
  heroMetaItem: { flex: 1, alignItems: 'center' },
  heroMetaLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  heroMetaValue: { fontSize: 12, fontWeight: '700' },
  heroMetaDivider: { width: 1, height: 30 },

  // Info Card
  infoCard: {
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.md },

  // Job ref
  jobRefRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  jobRefIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  jobRefText: { flex: 1 },
  jobRefName: { fontSize: 15, fontWeight: '700' },
  jobRefId: { fontSize: 12, marginTop: 2 },

  // Line items
  lineItemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  lineItemLabel: { flex: 1, fontSize: 13, fontWeight: '500', paddingRight: 12 },
  lineItemAmount: { fontSize: 13, fontWeight: '700' },
  itemDivider: { height: 1 },
  totalSection: { borderTopWidth: 1, marginTop: Spacing.sm, paddingTop: Spacing.sm },

  rowField: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 13, fontWeight: '600' },

  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    borderTopWidth: 1,
  },
  grandTotalLabel: { fontSize: 15, fontWeight: '700' },
  grandTotalValue: { fontSize: 18, fontWeight: '800' },

  // CTA
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
  outlineBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  outlineBtnText: { fontSize: 14, fontWeight: '700' },
  ctaBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaBtnText: { fontSize: 15, fontWeight: '700' },
});
