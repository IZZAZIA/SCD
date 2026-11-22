import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/theme';

export default function Screen({ children, onRefresh, style }) {
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, style]}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} /> : undefined}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2, gap: spacing.md },
});
