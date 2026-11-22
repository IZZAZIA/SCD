import React, { useEffect, useState } from 'react';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Chips from '../../components/Chips';
import TextField from '../../components/TextField';
import DateField from '../../components/DateField';
import PickerField from '../../components/PickerField';
import TimeField from '../../components/TimeField';
import { Loading } from '../../components/StateViews';
import * as eventApi from '../../api/eventApi';
import { EVENT_TYPES, societyOptions } from '../../config/constants';
import { notify, notifyError } from '../../utils/dialogs';

const EMPTY = { title: '', description: '', type: EVENT_TYPES[0], society: '', date: '', startTime: '', endTime: '', venue: '', capacity: '' };

// FR-4 (create) and FR-5 (edit).
export default function EventFormScreen({ route, navigation }) {
  const eventId = route.params?.eventId;
  const editing = !!eventId;
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit event' : 'New event' });
    if (!editing) return;
    eventApi.get(eventId)
      .then((e) => setForm(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, String(e[k] ?? '')]))))
      .catch(notifyError)
      .finally(() => setLoading(false));
  }, [editing, eventId, navigation]);

  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity) };
      const saved = editing ? await eventApi.update(eventId, payload) : await eventApi.create(payload);
      if (saved.cancelledBookings) {
        notify('Resource requests released', `${saved.cancelledBookings} booking request(s) were cancelled because the time changed. Request them again for the new time.`);
      }
      navigation.goBack();
    } catch (e) {
      notifyError(e);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading />;
  return (
    <Screen>
      <TextField label="Title" value={form.title} onChangeText={set('title')} autoCapitalize="sentences" />
      <Chips label="Category" options={EVENT_TYPES} value={form.type} onChange={set('type')} />
      <PickerField label="Society (optional)" value={form.society} options={societyOptions} onChange={set('society')} placeholder="Choose a society" clearable />
      <DateField label="Date" value={form.date} onChange={set('date')} />
      <TimeField label="Starts at" value={form.startTime} onChange={set('startTime')} />
      <TimeField label="Ends at" value={form.endTime} onChange={set('endTime')} />
      <TextField label="Venue" value={form.venue} onChangeText={set('venue')} autoCapitalize="words" />
      <TextField label="Capacity" value={form.capacity} onChangeText={set('capacity')} keyboardType="number-pad" />
      <TextField label="Description (optional)" value={form.description} onChangeText={set('description')} multiline autoCapitalize="sentences" />
      <Button title={editing ? 'Save changes' : 'Create event'} icon="checkmark-circle-outline" onPress={save} loading={busy} />
    </Screen>
  );
}
