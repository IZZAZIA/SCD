import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme/theme';

// Single-choice selector. options: ['A','B'] or [{ value, label }].
export default function Chips({ label, options, value, onChange }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          const on = opt.value === value;
          return (
            <Pressable key={String(opt.value)} onPress={() => onChange(opt.value)} style={[styles.chip, on && styles.chipOn]}>
              <Text style={[styles.text, on && styles.textOn]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  row: { gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { fontSize: 14, color: colors.ink },
  textOn: { color: '#fff', fontWeight: '600' },
});
