import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import useAuth from '../../hooks/useAuth';
import { notifyError } from '../../utils/dialogs';
import { colors, radius } from '../../theme/theme';

const PORTALS = [
  { key: 'student', label: 'Student', icon: 'school-outline' },
  { key: 'admin', label: 'Admin', icon: 'shield-checkmark-outline' },
];

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [portal, setPortal] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const isAdmin = portal === 'admin';

  const switchTo = (key) => { setPortal(key); setIdentifier(''); setPassword(''); };

  const submit = async () => {
    setBusy(true);
    try {
      await signIn(identifier.trim(), password, portal);
    } catch (e) {
      notifyError(e);
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}><Ionicons name="calendar" size={38} color={colors.primaryDark} /></View>
        <Text style={styles.brand}>BOOKT</Text>
        <Text style={styles.tagline}>Campus events and resource booking</Text>

        <View style={styles.card}>
          <View style={styles.segment}>
            {PORTALS.map((p) => {
              const on = p.key === portal;
              return (
                <Pressable key={p.key} style={[styles.segmentItem, on && styles.segmentOn]} onPress={() => switchTo(p.key)}>
                  <Ionicons name={p.icon} size={18} color={on ? '#fff' : colors.primary} />
                  <Text style={[styles.segmentText, on && { color: '#fff' }]}>{p.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.hint}>
            {isAdmin ? 'Administrators and resource managers sign in here.' : 'Students, societies and event organizers sign in here.'}
          </Text>
          <TextField
            label={isAdmin ? 'Username' : 'Email'}
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType={isAdmin ? 'default' : 'email-address'}
            placeholder={isAdmin ? 'Your username' : 'you@campus.edu'}
          />
          <View>
            <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry={!show} placeholder="Your password" />
            <Pressable style={styles.eye} onPress={() => setShow((s) => !s)} hitSlop={10}>
              <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.muted} />
            </Pressable>
          </View>
          <Button title={isAdmin ? 'Sign in as admin' : 'Sign in'} icon="log-in-outline" onPress={submit} loading={busy} disabled={!identifier || !password} />
        </View>

        {!isAdmin ? (
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>New student? Create an account</Text>
          </Pressable>
        ) : (
          <Text style={styles.note}>Admin accounts are created by the system administrator.</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 10 },
  logo: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  brand: { fontSize: 40, fontWeight: '800', color: '#fff', letterSpacing: 3, textAlign: 'center' },
  tagline: { fontSize: 15, color: '#CFE0E5', textAlign: 'center', marginBottom: 14 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 18, gap: 14 },
  segment: { flexDirection: 'row', backgroundColor: '#E8F0F2', borderRadius: radius.md, padding: 4 },
  segmentItem: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  segmentOn: { backgroundColor: colors.primary },
  segmentText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  hint: { fontSize: 14, color: colors.muted },
  eye: { position: 'absolute', right: 12, bottom: 12 },
  link: { color: colors.gold, fontSize: 16, fontWeight: '700', textAlign: 'center', paddingVertical: 10 },
  note: { color: '#CFE0E5', fontSize: 14, textAlign: 'center', paddingVertical: 10 },
});
