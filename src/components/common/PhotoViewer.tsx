import React, { useState } from 'react';
import {
  View, Image, TouchableOpacity, Modal, StyleSheet,
  FlatList, Text, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Spacing } from '../../theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  photos: string[];
  onRemove: (uri: string) => void;
  onCamera: () => void;
  onGallery: () => void;
}

export default function PhotoViewer({ photos, onRemove, onCamera, onGallery }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [viewerUri, setViewerUri] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);

  function openViewer(uri: string) {
    const idx = photos.indexOf(uri);
    setViewerIndex(idx >= 0 ? idx : 0);
    setViewerUri(uri);
  }

  return (
    <>
      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primaryLight, borderColor: `${colors.primary}30` }]}
          onPress={onCamera}
        >
          <Ionicons name="camera-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.cardBg, borderColor: colors.border }]}
          onPress={onGallery}
        >
          <Ionicons name="images-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Photo grid */}
      {photos.length > 0 && (
        <View style={styles.grid}>
          {photos.map((uri, index) => (
            <TouchableOpacity
              key={uri}
              style={styles.thumbWrap}
              onPress={() => openViewer(uri)}
              activeOpacity={0.85}
            >
              <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
              {/* View overlay */}
              <View style={styles.thumbOverlay}>
                <Ionicons name="expand-outline" size={14} color="#fff" />
              </View>
              {/* Remove button */}
              <TouchableOpacity
                style={[styles.removeBtn, { backgroundColor: colors.danger ?? '#FF3B30' }]}
                onPress={() => onRemove(uri)}
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <Ionicons name="close" size={10} color="#fff" />
              </TouchableOpacity>
              {/* Index badge */}
              <View style={[styles.indexBadge, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {/* Add more slot */}
          <TouchableOpacity
            style={[styles.addMoreSlot, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={onGallery}
          >
            <Ionicons name="add" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Fullscreen viewer modal */}
      <Modal
        visible={viewerUri !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setViewerUri(null)}
      >
        <View style={styles.viewerRoot}>
          {/* Header */}
          <View style={[styles.viewerHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerUri(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.viewerCount}>{viewerIndex + 1} / {photos.length}</Text>
            <TouchableOpacity
              style={styles.viewerClose}
              onPress={() => { onRemove(photos[viewerIndex]); setViewerUri(null); }}
            >
              <Ionicons name="trash-outline" size={22} color="#FF4D4D" />
            </TouchableOpacity>
          </View>

          {/* Full image */}
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            initialScrollIndex={viewerIndex}
            getItemLayout={(_, i) => ({ length: SCREEN_W, offset: SCREEN_W * i, index: i })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
              setViewerIndex(idx);
              setViewerUri(photos[idx]);
            }}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={styles.viewerImageWrap}>
                <Image
                  source={{ uri: item }}
                  style={styles.viewerImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />

          {/* Dot indicators */}
          {photos.length > 1 && (
            <View style={[styles.dotsRow, { paddingBottom: insets.bottom + 20 }]}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, { backgroundColor: i === viewerIndex ? '#fff' : 'rgba(255,255,255,0.4)' }]}
                />
              ))}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const THUMB_SIZE = 88;

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  thumbWrap: { width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  indexText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  addMoreSlot: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Viewer
  viewerRoot: { flex: 1, backgroundColor: '#000' },
  viewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: 12,
  },
  viewerClose: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  viewerCount: { color: '#fff', fontSize: 15, fontWeight: '600' },
  viewerImageWrap: { width: SCREEN_W, height: SCREEN_H, alignItems: 'center', justifyContent: 'center' },
  viewerImage: { width: SCREEN_W, height: SCREEN_H },
  dotsRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
