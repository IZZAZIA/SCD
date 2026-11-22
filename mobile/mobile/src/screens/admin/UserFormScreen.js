import React, { useEffect, useState } from 'react';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Chips from '../../components/Chips';
import TextField from '../../components/TextField';
import * as userApi from '../../api/userApi';
import { ROLES, ROLE_KEYS } from '../../config/constants';
import { confirmAction, notify, notifyError } from '../../utils/dialogs';

// FR-3: add, edit, deactivate or delete users.
export default function UserFormScreen({ route, navigation }) {
  const existing = route.params?.user;
  const editing = !!existing;
  const [form, setForm] = useState({
    name: existing?.name ?? '', email: existing?.email ?? '', username: existing?.username ?? '',
    password: '', role: existing?.role ?? 'student',
  });
  const [status, setStatus] = useState(existing?.status ?? 'active');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const staff = form.role === 'admin' || form.role === 'resource_manager';

  useEffect(() => { navigation.setOptions({ title: editing ? 'Edit user' : 'New user' }); }, [editing, navigation]);

  const save = async () => {
    setBusy(true);
    try {
      if (editing) {
        const { password, ...rest } = form;
        await userApi.update(existing.id, password ? form : rest);
      } else {
        await userApi.create(form);
      }
      navigation.goBack();
    } catch (e) {
      notifyError(e);
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async () => {
    const next = status === 'active' ? 'inactive' : 'active';
    if (next === 'inactive' && !(await confirmAction(`Deactivate ${existing.name}?`, 'They will no longer be able to sign in.', 'Deactivate'))) return;
    try {
      await userApi.update(existing.id, { status: next });
      setStatus(next);
      notify(next === 'active' ? 'Account reactivated' : 'Account deactivated');
    } catch (e) {
      notifyError(e);
    }
  };

  const remove = async () => {
    if (!(await confirmAction(`Delete ${existing.name}?`, 'Users with events or bookings should be deactivated instead.', 'Delete'))) return;
    try {
      await userApi.remove(existing.id);
      navigation.goBack();
    } catch (e) {
      notifyError(e);
    }
  };

  return (
    <Screen>
      <TextField label="Full name" value={form.name} onChangeText={set('name')} autoCapitalize="words" />
      <TextField label="Email" value={form.email} onChangeText={set('email')} keyboardType="email-address" />
      <Chips label="Role" options={ROLE_KEYS.map((k) => ({ value: k, label: ROLES[k] }))} value={form.role} onChange={set('role')} />
      <TextField
        label={staff ? 'Username (used to sign in on the Admin tab)' : 'Username (optional)'}
        value={form.username} onChangeText={set('username')}
      />
      <TextField label={editing ? 'New password (optional)' : 'Password'} value={form.password} onChangeText={set('password')} secureTextEntry hint="At least 8 characters." />
      <Button title={editing ? 'Save changes' : 'Add user'} icon="checkmark-circle-outline" onPress={save} loading={busy} />
      {editing ? (
        <>
          <Button title={status === 'active' ? 'Deactivate account' : 'Reactivate account'} icon={status === 'active' ? 'ban-outline' : 'refresh-outline'} variant="secondary" onPress={toggleStatus} />
          <Button title="Delete user" icon="trash-outline" variant="danger" onPress={remove} />
        </>
      ) : null}
    </Screen>
  );
}
