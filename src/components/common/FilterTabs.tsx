import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export interface FilterOption {
  id: string;
  label: string;
}

interface Props {
  options: FilterOption[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function FilterTabs({ options, activeId, onSelect }: Props) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      style={styles.scroll}
    >
      {options.map((option) => {
        const isActive = activeId === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? colors.primary : colors.cardBg,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.label, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: Spacing.lg,
    flexShrink: 0,
    flexGrow: 0,
  },
  container: {
    paddingHorizontal: Spacing.base,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
