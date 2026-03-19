import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import AppButton from '../../../components/common/AppButton';
import AppInput from '../../../components/common/AppInput';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import { Colors, Spacing, Typography } from '../../../theme';
import { useAuth } from '../../../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigation.replace('Main');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Enter credentials to continue.</Text>

        <View style={styles.form}>
          <AppInput
            label="WORK EMAIL"
            placeholder="name@voltinstall.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <AppInput
            label="PASSWORD"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        {loading ? (
          <ActivityIndicator color={Colors.primary} size="large" style={{ marginTop: 8 }} />
        ) : (
          <AppButton title="Access Account" onPress={handleSignIn} />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl + 16,
    paddingBottom: Spacing.xxl,
  },
  title: {
    ...Typography.displayMedium,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxxl,
  },
  form: { marginBottom: Spacing.xl },
  error: {
    color: '#FF3B30',
    fontSize: 13,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
});
