import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../context/ThemeContext';
import { NewsItem } from '../data/mock';

interface Props {
  item: NewsItem;
}

export default function NewsCard({ item }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.cardBg }]}
      activeOpacity={0.7}
    >
      <View style={[styles.emojiWrapper, { backgroundColor: colors.background }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
        <Text style={[styles.time, { color: colors.textSecondary }]}>{item.time}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  emojiWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
  },
});
