import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import TextField from '../../components/TextField';
import { SectionTitle } from '../../components/StateViews';
import useAuth from '../../hooks/useAuth';
import * as authApi from '../../api/authApi';
import { ROLES } from '../../config/constants';
import { notify, notifyError } from '../../utils/dialogs';
import { colors } from '../../theme/theme';

export default function ProfileScreen() {
  const { user, updateProfile, signOut } = useAuth();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(null);

  const run = async (key, work, done) => {
    setBusy(key);
    try { await work(); notify(done); } catch (e) { notifyError(e); } finally { setBusy(null); }
  };

  return (
    <Screen>
      <View style={styles.head}>
        <View style={styles.avatar}><Text style={styles.initial}>{user.name.charAt(0).toUpperCase()}</Text></View>
        <View style={{ flexShrink: 1, gap: 4 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Badge status="Scheduled" label={ROLES[user.role]} />
          {user.username ? <Text style={styles.meta}>Username: {user.username}</Text> : null}
        </View>
      </View>

      <SectionTitle>Your details</SectionTitle>
      <TextField label="Full name" value={name} onChangeText={setName} autoCapitalize="words" />
      <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Button title="Save details" icon="save-outline" loading={busy === 'profile'} onPress={() => run('profile', () => updateProfile({ name, email }), 'Details saved')} />

      <SectionTitle>Change password</SectionTitle>
      <TextField label="Current password" value={current} onChangeText={setCurrent} secureTextEntry />
      <TextField label="New password" value={next} onChangeText={setNext} secureTextEntry hint="At least 8 characters." />
      <Button
        title="Change password" icon="lock-closed-outline" variant="secondary" loading={busy === 'password'} disabled={!current || !next}
        onPress={() => run('password', async () => { await authApi.changePassword(current, next); setCurrent(''); setNext(''); }, 'Password changed')}
      />

      <Button title="Sign out" icon="log-out-outline" variant="danger" onPress={signOut} style={{ marginTop: 20 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.line },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 26, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: colors.ink },
  meta: { fontSize: 14, color: colors.muted },
});
