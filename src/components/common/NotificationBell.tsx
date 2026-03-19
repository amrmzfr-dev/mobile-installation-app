import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'alert' | 'info' | 'success';
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Job Acceptance Required',
    message: 'JOB-4031 at Sunset Plaza must be accepted by 5:00 PM today.',
    time: '10m ago',
    read: false,
    type: 'alert',
  },
  {
    id: '2',
    title: 'Installation Due Tomorrow',
    message: 'JOB-4028 at Venice Beach is scheduled for 9:00 AM tomorrow.',
    time: '1h ago',
    read: false,
    type: 'alert',
  },
  {
    id: '3',
    title: 'Invoice INV-103 Pending',
    message: 'Payment for Greenway Condos is overdue. Due Nov 05, 2024.',
    time: '3h ago',
    read: true,
    type: 'info',
  },
  {
    id: '4',
    title: 'Survey Completed',
    message: 'JOB-4025 survey approved. Ready for installation scheduling.',
    time: '1d ago',
    read: true,
    type: 'success',
  },
];

interface Props {
  count?: number;
  onPress?: () => void;
}

export default function NotificationBell({ count = 0 }: Props) {
  const { colors, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const typeConfig = {
    alert: { icon: 'alert-circle' as const, color: colors.alertRed },
    info: { icon: 'information-circle' as const, color: colors.primary },
    success: { icon: 'checkmark-circle' as const, color: '#059669' },
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.container}
        activeOpacity={0.7}
      >
        <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
        {unread > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.alertRed }]}>
            <Text style={styles.badgeText}>{unread}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.panel,
              {
                backgroundColor: colors.cardBg,
                borderColor: colors.border,
                shadowColor: '#000',
              },
            ]}
            onPress={() => {}}
          >
            {/* Arrow */}
            <View style={[styles.arrow, { borderBottomColor: colors.border }]} />
            <View style={[styles.arrowInner, { borderBottomColor: colors.cardBg }]} />

            {/* Header */}
            <View style={[styles.panelHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Notifications</Text>
              {unread > 0 && (
                <View style={[styles.unreadChip, { backgroundColor: isDark ? '#FF4D4D22' : '#FFF0F0' }]}>
                  <Text style={[styles.unreadChipText, { color: colors.alertRed }]}>
                    {unread} new
                  </Text>
                </View>
              )}
            </View>

            <ScrollView
              style={styles.list}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {MOCK_NOTIFICATIONS.map((item, idx) => {
                const cfg = typeConfig[item.type];
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.item,
                      { borderBottomColor: colors.border },
                      idx === MOCK_NOTIFICATIONS.length - 1 && styles.itemLast,
                      !item.read && { backgroundColor: isDark ? `${colors.primary}08` : `${colors.primary}06` },
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconWrap, { backgroundColor: isDark ? `${cfg.color}20` : `${cfg.color}15` }]}>
                      <Ionicons name={cfg.icon} size={16} color={cfg.color} />
                    </View>
                    <View style={styles.itemContent}>
                      <View style={styles.itemTop}>
                        <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                          {item.title}
                        </Text>
                        {!item.read && (
                          <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                        )}
                      </View>
                      <Text style={[styles.itemMessage, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.message}
                      </Text>
                      <Text style={[styles.itemTime, { color: colors.textMuted }]}>{item.time}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Footer */}
            <TouchableOpacity
              style={[styles.footer, { borderTopColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.footerText, { color: colors.primary }]}>Mark all as read</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  panel: {
    position: 'absolute',
    top: 60,
    right: Spacing.base,
    width: 320,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  arrow: {
    position: 'absolute',
    top: -8,
    right: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowInner: {
    position: 'absolute',
    top: -6,
    right: 21,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    zIndex: 1,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  unreadChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unreadChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  list: {
    maxHeight: 280,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    flexShrink: 0,
  },
  itemMessage: {
    fontSize: 12,
    lineHeight: 17,
  },
  itemTime: {
    fontSize: 11,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
