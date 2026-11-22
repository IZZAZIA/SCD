import React from 'react';
import PickerField from './PickerField';

const pad = (n) => String(n).padStart(2, '0');
const OPTIONS = [];
for (let h = 6; h <= 23; h += 1) {
  for (const m of [0, 30]) OPTIONS.push({ value: `${pad(h)}:${pad(m)}`, label: `${pad(h)}:${pad(m)}` });
}

export default function TimeField({ label, value, onChange }) {
  return <PickerField label={label} value={value} options={OPTIONS} onChange={onChange} icon="time-outline" placeholder="Choose a time" />;
}
