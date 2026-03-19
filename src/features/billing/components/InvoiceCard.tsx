import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import { Invoice } from '../data/mock';

interface Props {
  invoice: Invoice;
  onPress?: () => void;
  onDownload?: () => void;
}

export default function InvoiceCard({ invoice, onPress, onDownload }: Props) {
  const { colors, isDark } = useTheme();
  const isPaid = invoice.status === 'paid';
  const statusColor = isPaid ? colors.primary : colors.alertYellow;
  const statusBg = isPaid
    ? isDark ? `${colors.primary}20` : colors.primaryLight
    : isDark ? `${colors.alertYellow}20` : colors.alertYellowBg;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Left accent strip */}
      <View style={[styles.accentStrip, { backgroundColor: statusColor }]} />

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.invoiceId, { color: colors.textPrimary }]}>{invoice.invoiceId}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {invoice.date}&nbsp;·&nbsp;{invoice.type}
        </Text>
      </View>

      {/* Right: amount + status + download */}
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>{invoice.amount}</Text>
        <View style={styles.bottomRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <View style={[styles.dot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {isPaid ? 'Paid' : 'Pending'}
            </Text>
          </View>
          <TouchableOpacity style={styles.pdfButton} onPress={onDownload} activeOpacity={0.7}>
            <Ionicons name="download-outline" size={11} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingRight: Spacing.sm,
    paddingLeft: 0,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  accentStrip: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  invoiceId: {
    fontSize: 14,
    fontWeight: '700',
  },
  meta: {
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: Spacing.sm,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  pdfButton: {
    padding: 2,
  },
  chevron: {
    marginLeft: 4,
  },
});
