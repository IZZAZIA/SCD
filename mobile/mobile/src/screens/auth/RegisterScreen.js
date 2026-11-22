import React, { useState } from 'react';
import { Text } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import useAuth from '../../hooks/useAuth';
import { notifyError } from '../../utils/dialogs';
import { colors } from '../../theme/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setBusy(true);
    try {
      await register({ ...form, name: form.name.trim(), email: form.email.trim() });
    } catch (e) {
      notifyError(e);
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Text style={{ color: colors.muted, fontSize: 15 }}>
        Create a student account to join events, or to request rooms and equipment for your society's events.
      </Text>
      <TextField label="Full name" value={form.name} onChangeText={set('name')} autoCapitalize="words" />
      <TextField label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" />
      <TextField label="Password" value={form.password} onChangeText={set('password')} secureTextEntry hint="At least 8 characters." />
      <Button title="Create account" onPress={submit} loading={busy} disabled={!form.name || !form.email || !form.password} />
    </Screen>
  );
}
