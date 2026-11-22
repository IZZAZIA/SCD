import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import BookingCard from '../../components/BookingCard';
import InfoRow from '../../components/InfoRow';
import { Loadable, SectionTitle } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import * as eventApi from '../../api/eventApi';
import * as registrationApi from '../../api/registrationApi';
import * as bookingApi from '../../api/bookingApi';
import { confirmAction, notify, notifyError } from '../../utils/dialogs';
import { formatDate, formatTimeRange } from '../../utils/format';
import { colors } from '../../theme/theme';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const { user, can } = useAuth();
  const [busy, setBusy] = useState(false);

  const state = useApi(async () => {
    const event = await eventApi.get(eventId);
    const regs = can('event.register') ? await registrationApi.mine() : [];
    // FR-15: the organizer sees the resource requests of this event right here.
    const bookings = can('booking.request') ? (await bookingApi.mine()).filter((b) => b.eventId === eventId) : [];
    return { event, bookings, registered: regs.some((r) => r.eventId === eventId) };
  }, [eventId]);

  const run = async (work, doneMessage) => {
    setBusy(true);
    try {
      await work();
      if (doneMessage) notify(doneMessage);
      await state.reload();
    } catch (e) {
      notifyError(e);
    } finally {
      setBusy(false);
    }
  };

  const cancelEvent = async () => {
    if (await confirmAction('Cancel this event?', 'Registered students will be notified and resource bookings will be released.', 'Cancel event')) {
      run(() => eventApi.cancel(eventId), 'Event cancelled');
    }
  };

  const unregister = async () => {
    if (await confirmAction('Cancel your registration?', undefined, 'Cancel registration')) {
      run(() => registrationApi.unregister(eventId), 'Registration cancelled');
    }
  };

  return (
    <Screen onRefresh={state.reload}>
      <Loadable state={state}>
        {({ event, bookings, registered }) => {
          const cancelled = event.status === 'Cancelled';
          const isOwner = (can('event.manage') && event.organizerId === user.id) || can('event.manage.any');
          return (
            <>
              <Text style={styles.title}>{event.title}</Text>
              <View style={styles.badges}>
                <Badge status={event.status} />
                <Badge status="Scheduled" label={event.type} />
              </View>
              <View style={styles.box}>
                <InfoRow icon="calendar-outline" text={formatDate(event.date)} color={colors.ink} />
                <InfoRow icon="time-outline" text={formatTimeRange(event.startTime, event.endTime)} color={colors.ink} />
                <InfoRow icon="location-outline" text={event.venue} color={colors.ink} />
                {event.society ? <InfoRow icon="ribbon-outline" text={event.society} color={colors.ink} /> : null}
                <InfoRow icon="people-outline" text={`${event.registeredCount} of ${event.capacity} seats taken`} color={colors.ink} />
              </View>
              {event.description ? <Text style={styles.description}>{event.description}</Text> : null}

              {can('event.register') && !cancelled ? (
                registered
                  ? <Button title="Cancel registration" icon="close-circle-outline" variant="danger" onPress={unregister} loading={busy} />
                  : <Button title={event.seatsLeft === 0 ? 'Event is full' : 'Register'} icon="checkmark-circle-outline" onPress={() => run(() => registrationApi.register(eventId), 'You are registered')} loading={busy} disabled={event.seatsLeft === 0} />
              ) : null}

              {isOwner && !cancelled ? (
                <>
                  <Button title="Edit event" icon="create-outline" variant="secondary" onPress={() => navigation.navigate('EventForm', { eventId })} />
                  {can('booking.request') ? <Button title="Request resources" icon="business-outline" onPress={() => navigation.navigate('RequestBooking', { eventId })} /> : null}
                  <Button title="View attendees" icon="people-outline" variant="secondary" onPress={() => navigation.navigate('Attendees', { eventId })} />
                  <Button title="Cancel event" icon="trash-outline" variant="danger" onPress={cancelEvent} loading={busy} />
                </>
              ) : null}

              {bookings.length > 0 ? (
                <>
                  <SectionTitle>Resource requests</SectionTitle>
                  {bookings.map((b) => <BookingCard key={b.id} booking={b} />)}
                </>
              ) : null}
            </>
          );
        }}
      </Loadable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  badges: { flexDirection: 'row', gap: 8 },
  box: { backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 10 },
  description: { fontSize: 16, color: colors.ink, lineHeight: 23 },
});
