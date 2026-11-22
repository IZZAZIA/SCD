import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme';

export default function InfoRow({ icon, text, color = colors.muted }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  text: { fontSize: 14, flexShrink: 1 },
});
