import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import TimeField from '../../components/TimeField';
import { Loadable, SectionTitle } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as eventApi from '../../api/eventApi';
import * as resourceApi from '../../api/resourceApi';
import * as bookingApi from '../../api/bookingApi';
import { notify, notifyError } from '../../utils/dialogs';
import { formatDate, toIso } from '../../utils/format';
import { colors } from '../../theme/theme';

// FR-10: request one or more resources for an event's time slot. The server runs conflict detection (FR-11).
export default function RequestBookingScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [selected, setSelected] = useState([]);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [busy, setBusy] = useState(false);

  const state = useApi(async () => {
    const [event, resources] = await Promise.all([eventApi.get(eventId), resourceApi.list()]);
    return { event, resources };
  }, [eventId]);

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = async (event) => {
    setBusy(true);
    try {
      const body = {
        eventId,
        resourceIds: selected,
        startTime: toIso(event.date, start ?? event.startTime),
        endTime: toIso(event.date, end ?? event.endTime),
      };
      const { warnings } = await bookingApi.request(body);
      notify('Request sent', ['A resource manager will review it. Track it under My bookings.', ...warnings].join('\n'));
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
        {({ event, resources }) => (
          <>
            <SectionTitle>{event.title}</SectionTitle>
            <Text style={styles.meta}>{formatDate(event.date)}</Text>
            <TimeField label="From" value={start ?? event.startTime} onChange={setStart} />
            <TimeField label="Until" value={end ?? event.endTime} onChange={setEnd} />
            <Text style={styles.meta}>Prefilled with the event's time. Change it only if you need the resource for a different slot.</Text>

            <SectionTitle>Choose resources</SectionTitle>
            {resources.map((r) => {
              const on = selected.includes(r.id);
              return (
                <Card key={r.id} onPress={() => toggle(r.id)} style={on && styles.selected}>
                  <View style={styles.top}>
                    <Text style={styles.name}>{r.name}</Text>
                    {on ? <Badge status="Approved" label="Selected" /> : r.availableNow ? <Badge status="available" label="Available now" /> : <Badge status={r.status === 'available' ? 'inUse' : r.status} label={r.status === 'available' ? 'In use now' : 'Not bookable'} />}
                  </View>
                  <Text style={styles.meta}>{r.type}, {r.location}</Text>
                  <Button title="View schedule" variant="secondary" onPress={() => navigation.navigate('ResourceAvailability', { resourceId: r.id })} />
                </Card>
              );
            })}
            <Button title={`Send request${selected.length ? ` (${selected.length})` : ''}`} onPress={() => submit(event)} loading={busy} disabled={selected.length === 0} />
          </>
        )}
      </Loadable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { fontSize: 14, color: colors.muted },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { fontSize: 17, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  selected: { borderColor: colors.primary, borderWidth: 2 },
});
