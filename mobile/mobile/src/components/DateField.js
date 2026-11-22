import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme/theme';
import { formatDate } from '../utils/format';

const pad = (n) => String(n).padStart(2, '0');
const toStr = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// A month calendar in a bottom sheet. Pick any day; past days are locked unless allowPast is set.
export default function DateField({ label = 'Date', value, onChange, clearable, allowPast = false, placeholder = 'Choose a date' }) {
  const now = new Date();
  const todayStr = toStr(now.getFullYear(), now.getMonth(), now.getDate());
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() });

  const show = () => {
    const seed = value ? new Date(`${value}T00:00:00`) : new Date();
    setView({ y: seed.getFullYear(), m: seed.getMonth() });
    setOpen(true);
  };
  const shift = (delta) => setView((v) => {
    const d = new Date(v.y, v.m + delta, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const weeks = useMemo(() => {
    const lead = (new Date(view.y, view.m, 1).getDay() + 6) % 7; // Monday first
    const total = new Date(view.y, view.m + 1, 0).getDate();
    const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
    while (cells.length % 7) cells.push(null);
    return Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));
  }, [view]);

  const atCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth();
  const choose = (d) => { onChange(toStr(view.y, view.m, d)); setOpen(false); };

  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable style={styles.field} onPress={show}>
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={[styles.value, !value && { color: '#8FA0A7' }]} numberOfLines={1}>{value ? formatDate(value) : placeholder}</Text>
        {clearable && value ? (
          <Pressable hitSlop={10} onPress={() => onChange('')}><Ionicons name="close-circle" size={20} color={colors.muted} /></Pressable>
        ) : <Ionicons name="chevron-down" size={20} color={colors.muted} />}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.header}>
              <Pressable hitSlop={10} onPress={() => shift(-1)} disabled={!allowPast && atCurrentMonth} style={!allowPast && atCurrentMonth && { opacity: 0.25 }}>
                <Ionicons name="chevron-back" size={24} color={colors.primary} />
              </Pressable>
              <Text style={styles.month}>{MONTHS[view.m]} {view.y}</Text>
              <Pressable hitSlop={10} onPress={() => shift(1)}><Ionicons name="chevron-forward" size={24} color={colors.primary} /></Pressable>
            </View>
            <View style={styles.row}>
              {WEEKDAYS.map((w) => <Text key={w} style={styles.weekday}>{w}</Text>)}
            </View>
            {weeks.map((week, i) => (
              <View key={i} style={styles.row}>
                {week.map((d, j) => {
                  if (!d) return <View key={j} style={styles.cell} />;
                  const str = toStr(view.y, view.m, d);
                  const locked = !allowPast && str < todayStr;
                  const selected = str === value;
                  return (
                    <Pressable key={j} style={styles.cell} disabled={locked} onPress={() => choose(d)}>
                      <View style={[styles.day, str === todayStr && styles.today, selected && styles.selected]}>
                        <Text style={[styles.dayText, locked && { color: '#BCC8CD' }, selected && { color: '#fff', fontWeight: '800' }]}>{d}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
            <View style={styles.footer}>
              <Pressable onPress={() => { onChange(todayStr); setOpen(false); }}><Text style={styles.footerText}>Today</Text></Pressable>
              <Pressable onPress={() => setOpen(false)}><Text style={[styles.footerText, { color: colors.muted }]}>Close</Text></Pressable>
            </View>
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
    paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  value: { fontSize: 16, color: colors.ink, flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(16,38,45,0.5)', justifyContent: 'center', padding: 20 },
  sheet: { backgroundColor: colors.surface, borderRadius: 16, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  month: { fontSize: 18, fontWeight: '800', color: colors.ink },
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12.5, fontWeight: '700', color: colors.muted, paddingVertical: 6 },
  cell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: colors.gold },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { fontSize: 15, color: colors.ink },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 6 },
  footerText: { fontSize: 15, fontWeight: '700', color: colors.primary, paddingVertical: 6 },
});
