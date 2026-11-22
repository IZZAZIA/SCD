import React, { useState } from 'react';
import { Text } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Chips from '../../components/Chips';
import PickerField from '../../components/PickerField';
import TextField from '../../components/TextField';
import { EmptyState, Loadable } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as eventApi from '../../api/eventApi';
import * as notificationApi from '../../api/notificationApi';
import { notify, notifyError } from '../../utils/dialogs';
import { formatDate } from '../../utils/format';
import { colors } from '../../theme/theme';

const AUDIENCES = [{ value: 'registered', label: 'Registered students' }, { value: 'all', label: 'All students' }];

// FR-17: the admin sends a reminder as an in-app notification that students see in their Notifications.
export default function SendReminderScreen({ navigation }) {
  const state = useApi(() => eventApi.list(), []);
  const [eventId, setEventId] = useState(null);
  const [audience, setAudience] = useState('registered');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setBusy(true);
    try {
      const { sent } = await notificationApi.sendReminder({ eventId, audience, message });
      notify('Reminder sent', `${sent} student${sent === 1 ? '' : 's'} will see it in their notifications.`);
      navigation.goBack();
    } catch (e) {
      notifyError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen onRefresh={state.reload}>
      <Loadable state={state}>
        {(events) => (events.length === 0
          ? <EmptyState icon="alarm-outline" title="No upcoming events" hint="Create an event first, then you can remind students about it." />
          : (
            <>
              <Text style={{ color: colors.muted, fontSize: 15 }}>Choose an event and who should be reminded. Students see it in their notifications.</Text>
              <PickerField
                label="Event" value={eventId} placeholder="Choose an event" icon="chevron-down"
                options={events.map((e) => ({ value: e.id, label: `${e.title}, ${formatDate(e.date)} (${e.registeredCount} registered)` }))}
                onChange={setEventId}
              />
              <Chips label="Send to" options={AUDIENCES} value={audience} onChange={setAudience} />
              <TextField
                label="Message (optional)" value={message} onChangeText={setMessage} multiline autoCapitalize="sentences"
                placeholder="e.g. Bring your student ID" hint="Leave empty to send the standard reminder with the time and venue."
              />
              <Button title="Send reminder" icon="send-outline" onPress={send} loading={busy} disabled={!eventId} />
            </>
          ))}
      </Loadable>
    </Screen>
  );
}
