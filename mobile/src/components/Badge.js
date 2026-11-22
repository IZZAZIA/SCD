import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, statusStyles } from '../theme/theme';

export default function Badge({ status, label }) {
  const s = statusStyles[status] || statusStyles.Cancelled;
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{label || status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  text: { fontSize: 12.5, fontWeight: '700' },
});
