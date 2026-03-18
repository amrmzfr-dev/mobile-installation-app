import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import { StatItem } from '../data/mock';

interface Props {
  item: StatItem;
}

export default function StatCard({ item }: Props) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
      <Ionicons
        name={item.iconName as React.ComponentProps<typeof Ionicons>['name']}
        size={22}
        color={item.iconColor}
        style={styles.icon}
      />
      <Text style={[styles.value, { color: colors.textPrimary }]}>{item.value}</Text>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{item.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: Spacing.base,
    margin: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 110,
  },
  icon: {
    marginBottom: Spacing.sm,
  },
  value: {
    ...Typography.displayMedium,
    marginBottom: Spacing.xs,
  },
  label: {
    ...Typography.label,
    fontSize: 10,
  },
});
