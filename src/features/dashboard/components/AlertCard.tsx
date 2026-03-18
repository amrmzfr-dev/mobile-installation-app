import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import { AlertItem } from '../data/mock';

interface Props {
  item: AlertItem;
}

export default function AlertCard({ item }: Props) {
  const { colors } = useTheme();
  const isError = item.type === 'error';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isError ? colors.alertRedBg : colors.alertYellowBg,
          borderLeftColor: isError ? colors.alertRed : colors.alertYellow,
        },
      ]}
    >
      <View style={styles.header}>
        <Ionicons
          name={isError ? 'alert-circle-outline' : 'shield-outline'}
          size={20}
          color={isError ? colors.alertRed : colors.alertYellow}
          style={styles.icon}
        />
        <Text style={[styles.title, { color: isError ? colors.alertRed : '#C47D00' }]}>
          {item.title}
        </Text>
      </View>
      <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
    paddingLeft: 28,
  },
});
