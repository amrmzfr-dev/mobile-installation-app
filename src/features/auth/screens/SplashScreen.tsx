import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { Spacing, Typography } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigation.replace('Main');
    }
  }, [isLoading, user]);

  return (
    <LinearGradient
      colors={['#0F7A5A', '#1A9E6E', '#2DC88A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <StatusBar style="light" />

      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Ionicons name="flash" size={40} color="rgba(255,255,255,0.95)" />
        </View>

        <Text style={styles.title}>VoltInstall Pro</Text>
        <Text style={styles.subtitle}>
          Empowering the future of EV{'\n'}charging infrastructure.
        </Text>

        {isLoading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    ...Typography.displayMedium,
    color: '#FFFFFF',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xxxl,
  },
  button: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: Spacing.base,
    paddingHorizontal: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A9E6E',
    letterSpacing: 0.2,
  },
});
