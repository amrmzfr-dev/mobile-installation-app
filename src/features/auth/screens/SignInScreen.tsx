import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import AppButton from '../../../components/common/AppButton';
import AppInput from '../../../components/common/AppInput';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import { Colors, Spacing, Typography } from '../../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    navigation.navigate('Main');
  };

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

        <AppButton title="Access Account" onPress={handleSignIn} />
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
  form: {
    marginBottom: Spacing.xl,
  },
});
