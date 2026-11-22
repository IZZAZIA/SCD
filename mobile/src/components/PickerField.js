import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme/theme';

// A tap-to-choose field that opens a bottom sheet. Used for dates and times so nobody has to type them.
export default function PickerField({ label, value, placeholder = 'Choose', options, onChange, icon = 'chevron-down', clearable }) {
  const [open, setOpen] = useState(false);
  const all = value && !options.some((o) => o.value === value) ? [{ value, label: value }, ...options] : options;
  const current = all.find((o) => o.value === value);
  const choose = (v) => { onChange(v); setOpen(false); };

  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={[styles.value, !current && { color: '#8FA0A7' }]} numberOfLines={1}>{current?.label ?? placeholder}</Text>
        {clearable && value ? (
          <Pressable hitSlop={10} onPress={() => onChange('')}><Ionicons name="close-circle" size={20} color={colors.muted} /></Pressable>
        ) : <Ionicons name={icon} size={20} color={colors.muted} />}
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{label || placeholder}</Text>
            <FlatList
              data={all}
              keyExtractor={(o) => String(o.value)}
              renderItem={({ item }) => (
                <Pressable style={[styles.option, item.value === value && styles.optionOn]} onPress={() => choose(item.value)}>
                  <Text style={[styles.optionText, item.value === value && { fontWeight: '700', color: colors.primary }]}>{item.label}</Text>
                  {item.value === value ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: colors.ink },
  field: {
    minHeight: 46, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, backgroundColor: colors.surface,
    paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  },
  value: { fontSize: 16, color: colors.ink, flexShrink: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(16,38,45,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxHeight: '65%', paddingTop: 16, paddingBottom: 24 },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.ink, paddingHorizontal: 20, paddingBottom: 8 },
  option: { paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionOn: { backgroundColor: '#EEF4F6' },
  optionText: { fontSize: 16, color: colors.ink },
});
