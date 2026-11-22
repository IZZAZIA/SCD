import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';
import { colors, radius } from '../theme/theme';

export const Loading = () => <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} />;

export function ErrorBanner({ message, onRetry }) {
  return (
    <View style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({ title, hint, icon = 'file-tray-outline' }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={44} color={colors.line} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
    </View>
  );
}

// Shows a spinner, an error with retry, or the children once data has arrived.
export function Loadable({ state, children }) {
  if (state.loading && !state.data) return <Loading />;
  if (state.error && !state.data) return <ErrorBanner message={state.error} onRetry={state.reload} />;
  return children(state.data);
}

export const SectionTitle = ({ children }) => <Text style={styles.section}>{children}</Text>;

const styles = StyleSheet.create({
  error: { backgroundColor: '#F8E0DD', borderRadius: radius.md, padding: 14, gap: 10 },
  errorText: { color: '#7D2118', fontSize: 15 },
  empty: { alignItems: 'center', paddingVertical: 36, gap: 6 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: colors.ink },
  emptyHint: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  section: { fontSize: 18, fontWeight: '700', color: colors.ink, marginTop: 8 },
});
