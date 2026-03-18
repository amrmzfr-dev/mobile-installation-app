import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, Typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  title: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  iconColor?: string;
}

export default function SectionHeader({ title, icon, iconColor }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={iconColor ?? colors.primary}
          style={styles.icon}
        />
      )}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.label,
    fontSize: 13,
  },
});
