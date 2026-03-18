import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import { Invoice } from '../data/mock';

interface Props {
  invoice: Invoice;
  onDownload?: () => void;
}

export default function InvoiceCard({ invoice, onDownload }: Props) {
  const { colors } = useTheme();
  const isPaid = invoice.status === 'paid';

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: isPaid ? colors.primaryLight : colors.alertYellowBg },
        ]}
      >
        <Ionicons
          name="card-outline"
          size={20}
          color={isPaid ? colors.primary : colors.alertYellow}
        />
      </View>

      <View style={styles.content}>
        <Text style={[styles.invoiceId, { color: colors.textPrimary }]}>{invoice.invoiceId}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {invoice.date} • {invoice.type}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>{invoice.amount}</Text>
        <TouchableOpacity style={styles.pdfButton} onPress={onDownload} activeOpacity={0.7}>
          <Ionicons name="download-outline" size={12} color={colors.primary} />
          <Text style={[styles.pdfText, { color: colors.primary }]}> PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  invoiceId: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  meta: {
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
