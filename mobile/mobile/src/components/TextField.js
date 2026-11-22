import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius } from '../theme/theme';

export default function TextField({ label, hint, multiline, style, ...props }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor="#8FA0A7"
        autoCapitalize="none"
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, style]}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  input: {
    minHeight: 46, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md,
    backgroundColor: colors.surface, paddingHorizontal: 12, fontSize: 16, color: colors.ink,
  },
  multiline: { minHeight: 90, paddingTop: 10, textAlignVertical: 'top' },
  hint: { fontSize: 13, color: colors.muted },
});
