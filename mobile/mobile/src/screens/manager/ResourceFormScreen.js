import React, { useEffect, useState } from 'react';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Chips from '../../components/Chips';
import TextField from '../../components/TextField';
import { Loading } from '../../components/StateViews';
import * as resourceApi from '../../api/resourceApi';
import { RESOURCE_STATUSES, RESOURCE_TYPES } from '../../config/constants';
import { confirmAction, notifyError } from '../../utils/dialogs';

// FR-8: add, update and remove resources.
export default function ResourceFormScreen({ route, navigation }) {
  const resourceId = route.params?.resourceId;
  const editing = !!resourceId;
  const [form, setForm] = useState({ name: '', type: RESOURCE_TYPES[0], location: '', capacity: '', status: 'available' });
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    navigation.setOptions({ title: editing ? 'Edit resource' : 'New resource' });
    if (!editing) return;
    resourceApi.list()
      .then((all) => {
        const r = all.find((x) => x.id === resourceId);
        if (r) setForm({ name: r.name, type: r.type, location: r.location, capacity: String(r.capacity), status: r.status });
      })
      .catch(notifyError)
      .finally(() => setLoading(false));
  }, [editing, resourceId, navigation]);

  const save = async () => {
    setBusy(true);
    try {
      const body = { ...form, capacity: Number(form.capacity) };
      if (editing) await resourceApi.update(resourceId, body);
      else await resourceApi.create(body);
      navigation.goBack();
    } catch (e) {
      notifyError(e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!(await confirmAction('Delete this resource?', 'This cannot be undone.', 'Delete'))) return;
    try {
      await resourceApi.remove(resourceId);
      navigation.goBack();
    } catch (e) {
      notifyError(e);
    }
  };

  if (loading) return <Loading />;
  return (
    <Screen>
      <TextField label="Name" value={form.name} onChangeText={set('name')} autoCapitalize="words" />
      <Chips label="Type" options={RESOURCE_TYPES} value={form.type} onChange={set('type')} />
      <TextField label="Location" value={form.location} onChangeText={set('location')} autoCapitalize="words" />
      <TextField label="Capacity" value={form.capacity} onChangeText={set('capacity')} keyboardType="number-pad" hint="Use 0 for equipment." />
      <Chips label="Status" options={RESOURCE_STATUSES} value={form.status} onChange={set('status')} />
      <Button title={editing ? 'Save changes' : 'Add resource'} onPress={save} loading={busy} />
      {editing ? <Button title="Delete resource" variant="danger" onPress={remove} /> : null}
    </Screen>
  );
}
