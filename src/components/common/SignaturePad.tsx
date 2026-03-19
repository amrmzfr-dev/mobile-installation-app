/**
 * SignaturePad — draw-on-screen signature with fullscreen modal.
 *
 * Usage:
 *   <SignaturePad
 *     label="Customer Signature"
 *     value={customerSig}          // SVG path string or ''
 *     onChange={setCustomerSig}
 *   />
 *
 * Requires react-native-svg to be installed.
 */
import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  PanResponder, PanResponderGestureState, GestureResponderEvent,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PAD_W = SCREEN_W - 32;
const PAD_H = 220;

interface Props {
  label: string;
  sublabel?: string;
  value: string;           // comma-joined SVG path strings
  onChange: (v: string) => void;
}

function pointsToPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y} L${pts[0].x + 1},${pts[0].y + 1}`;
  const [first, ...rest] = pts;
  return `M${first.x},${first.y} ` + rest.map((p) => `L${p.x},${p.y}`).join(' ');
}

export default function SignaturePad({ label, sublabel, value, onChange }: Props) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [strokes, setStrokes] = useState<string[]>([]);
  const currentStroke = useRef<{ x: number; y: number }[]>([]);

  // When we open, pre-populate with existing value (if any stored strokes)
  function handleOpen() {
    if (value) {
      setStrokes(value.split('|||').filter(Boolean));
    } else {
      setStrokes([]);
    }
    setOpen(true);
  }

  function handleClear() {
    setStrokes([]);
    currentStroke.current = [];
  }

  function handleDone() {
    const joined = strokes.join('|||');
    onChange(joined);
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
  }

  const padRef = useRef<View>(null);
  const [padOffset, setPadOffset] = useState({ x: 0, y: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStroke.current = [{ x: locationX, y: locationY }];
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStroke.current = [...currentStroke.current, { x: locationX, y: locationY }];
        // Live redraw by appending a temp stroke
        setStrokes((prev) => {
          const withoutLast = prev.slice(0, -1);
          // last item is the "current" stroke being drawn
          return [...withoutLast, pointsToPath(currentStroke.current)];
        });
      },
      onPanResponderRelease: () => {
        const path = pointsToPath(currentStroke.current);
        if (path) {
          setStrokes((prev) => {
            // Replace the last (live) stroke with the finalized one
            const withoutLast = prev.length > 0 && prev[prev.length - 1] === pointsToPath(currentStroke.current)
              ? prev.slice(0, -1)
              : prev;
            return [...withoutLast, path];
          });
        }
        currentStroke.current = [];
      },
    })
  ).current;

  // Separate PanResponder that adds new strokes (on grant, start fresh)
  const drawPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStroke.current = [{ x: locationX, y: locationY }];
        setStrokes((prev) => [...prev, pointsToPath(currentStroke.current)]);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStroke.current = [...currentStroke.current, { x: locationX, y: locationY }];
        setStrokes((prev) => [...prev.slice(0, -1), pointsToPath(currentStroke.current)]);
      },
      onPanResponderRelease: () => {
        currentStroke.current = [];
      },
    })
  ).current;

  const hasSignature = value.trim().length > 0;
  const activeStrokes = strokes.filter(Boolean);

  return (
    <>
      <TouchableOpacity
        style={[styles.placeholder, {
          backgroundColor: colors.cardBg,
          borderColor: hasSignature ? colors.primary : colors.border,
          borderStyle: hasSignature ? 'solid' : 'dashed',
        }]}
        onPress={handleOpen}
        activeOpacity={0.85}
      >
        {hasSignature ? (
          /* Mini preview of signature */
          <View style={styles.previewWrap} pointerEvents="none">
            <Svg width="100%" height={80} viewBox={`0 0 ${PAD_W} ${PAD_H}`}>
              {value.split('|||').filter(Boolean).map((d, i) => (
                <Path key={i} d={d} stroke={isDark ? '#fff' : '#1A2340'} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              ))}
            </Svg>
            <View style={[styles.editBadge, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="create-outline" size={12} color={colors.primary} />
              <Text style={[styles.editBadgeText, { color: colors.primary }]}>Tap to re-sign</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyPlaceholder}>
            <Ionicons name="pencil-outline" size={24} color={colors.textMuted} />
            <Text style={[styles.placeholderText, { color: colors.textMuted }]}>Tap to sign</Text>
            {sublabel ? <Text style={[styles.placeholderSub, { color: colors.textMuted }]}>{sublabel}</Text> : null}
          </View>
        )}
      </TouchableOpacity>

      {/* Fullscreen signature modal */}
      <Modal visible={open} animationType="slide" statusBarTranslucent onRequestClose={handleCancel}>
        <View style={[styles.modalRoot, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { paddingTop: insets.top + 8, borderBottomColor: colors.border, backgroundColor: colors.cardBg }]}>
            <TouchableOpacity style={styles.modalHeaderBtn} onPress={handleCancel}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={styles.modalHeaderCenter}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{label}</Text>
              <Text style={[styles.modalSub, { color: colors.textSecondary }]}>Draw your signature below</Text>
            </View>
            <TouchableOpacity style={styles.modalHeaderBtn} onPress={handleClear}>
              <Text style={[styles.clearText, { color: colors.danger ?? '#FF3B30' }]}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Drawing area */}
          <View style={styles.drawingOuter}>
            <Text style={[styles.drawingHint, { color: colors.textMuted }]}>Sign in the box below with your finger</Text>
            <View
              style={[styles.drawingBox, { backgroundColor: '#FAFAFA', borderColor: colors.border }]}
              {...drawPanResponder.panHandlers}
            >
              <Svg width="100%" height="100%" style={StyleSheet.absoluteFillObject}>
                {activeStrokes.map((d, i) => (
                  <Path key={i} d={d} stroke="#1A2340" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                ))}
              </Svg>
              {activeStrokes.length === 0 && (
                <View style={styles.drawingPlaceholder} pointerEvents="none">
                  <Text style={styles.drawingPlaceholderLine}>✕</Text>
                </View>
              )}
            </View>
            <Text style={[styles.drawingLabel, { color: colors.textMuted }]}>_________________________</Text>
            <Text style={[styles.drawingLabel, { color: colors.textMuted }]}>{label}</Text>
          </View>

          {/* Done button */}
          <View style={[styles.modalFooter, { paddingBottom: insets.bottom + 16, borderTopColor: colors.border, backgroundColor: colors.cardBg }]}>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: activeStrokes.length > 0 ? colors.primary : colors.border }]}
              onPress={handleDone}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.doneBtnText}>
                {activeStrokes.length > 0 ? 'Confirm Signature' : 'Skip (No Signature)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 100,
    overflow: 'hidden',
  },
  previewWrap: {
    padding: 8,
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  editBadgeText: { fontSize: 10, fontWeight: '700' },
  emptyPlaceholder: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 20,
  },
  placeholderText: { fontSize: 14, fontWeight: '600' },
  placeholderSub: { fontSize: 11 },
  // Modal
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalHeaderBtn: { width: 60, alignItems: 'center', paddingVertical: 4 },
  modalHeaderCenter: { flex: 1, alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalSub: { fontSize: 12, marginTop: 2 },
  clearText: { fontSize: 14, fontWeight: '700' },
  drawingOuter: {
    flex: 1,
    padding: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawingHint: { fontSize: 13, marginBottom: 12, textAlign: 'center' },
  drawingBox: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
  },
  drawingPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawingPlaceholderLine: { fontSize: 64, color: '#E0E0E0', fontWeight: '100' },
  drawingLabel: { fontSize: 13, marginTop: 8, letterSpacing: 0.5 },
  modalFooter: {
    paddingHorizontal: Spacing.base,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  doneBtn: {
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  doneBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
