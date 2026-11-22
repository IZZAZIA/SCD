import React from 'react';
import Screen from '../../components/Screen';
import EventCard from '../../components/EventCard';
import { EmptyState, Loadable } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as registrationApi from '../../api/registrationApi';

export default function MyRegistrationsScreen({ navigation }) {
  const state = useApi(() => registrationApi.mine(), []);
  return (
    <Screen onRefresh={state.reload}>
      <Loadable state={state}>
        {(rows) => (rows.length === 0
          ? <EmptyState title="No registrations yet" hint="Open the Events tab and register for something that interests you." />
          : rows.map((r) => <EventCard key={r.id} event={{ ...r.event, seatsLeft: r.event.capacity }} onPress={() => navigation.navigate('EventDetail', { eventId: r.eventId })} />))}
      </Loadable>
    </Screen>
  );
}
