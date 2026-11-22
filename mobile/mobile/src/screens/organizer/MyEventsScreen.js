import React from 'react';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import EventCard from '../../components/EventCard';
import { EmptyState, Loadable } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as eventApi from '../../api/eventApi';

export default function MyEventsScreen({ navigation }) {
  const state = useApi(() => eventApi.mine(), []);
  return (
    <Screen onRefresh={state.reload}>
      <Button title="Create an event" onPress={() => navigation.navigate('EventForm')} />
      <Loadable state={state}>
        {(events) => (events.length === 0
          ? <EmptyState title="You have no events" hint="Create one, then request the halls and equipment it needs." />
          : events.map((e) => <EventCard key={e.id} event={e} onPress={() => navigation.navigate('EventDetail', { eventId: e.id })} />))}
      </Loadable>
    </Screen>
  );
}
