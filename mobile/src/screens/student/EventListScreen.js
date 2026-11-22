import React, { useEffect, useState } from 'react';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Chips from '../../components/Chips';
import DateField from '../../components/DateField';
import PickerField from '../../components/PickerField';
import TextField from '../../components/TextField';
import EventCard from '../../components/EventCard';
import { EmptyState, Loadable } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as eventApi from '../../api/eventApi';
import { EVENT_TYPES, societyOptions } from '../../config/constants';

const WHEN = [{ value: 'all', label: 'All upcoming' }, { value: 'week', label: 'This week' }];

// FR-6: upcoming events filtered by week, category, society, date or keyword (the server applies Strategy filters).
export default function EventListScreen({ navigation, route }) {
  const [when, setWhen] = useState(route?.params?.week ? 'week' : 'all');
  const [category, setCategory] = useState('All');
  const [society, setSociety] = useState('');
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState('');

  // Home tiles open this screen already filtered to the current week.
  useEffect(() => { if (route?.params?.week) setWhen('week'); }, [route?.params?.week]);

  const state = useApi(
    () => eventApi.list({ week: when === 'week' ? 'current' : undefined, category: category === 'All' ? undefined : category, society, date, search: searched }),
    [when, category, society, date, searched]
  );
  const active = when !== 'all' || category !== 'All' || society || date || searched;
  const clear = () => { setWhen('all'); setCategory('All'); setSociety(''); setDate(''); setSearch(''); setSearched(''); };

  return (
    <Screen onRefresh={state.reload}>
      <TextField value={search} onChangeText={setSearch} placeholder="Search events by title or venue" returnKeyType="search" onSubmitEditing={() => setSearched(search.trim())} />
      <Button title="Search" icon="search" variant="secondary" onPress={() => setSearched(search.trim())} />
      <Chips label="When" options={WHEN} value={when} onChange={setWhen} />
      <Chips label="Category" options={['All', ...EVENT_TYPES]} value={category} onChange={setCategory} />
      <PickerField label="Society" value={society} options={societyOptions} onChange={setSociety} placeholder="Any society" clearable />
      <DateField label="Date" value={date} onChange={setDate} clearable placeholder="Any date" />
      {active ? <Button title="Clear filters" icon="close-circle-outline" variant="danger" onPress={clear} /> : null}
      <Loadable state={state}>
        {(events) => (events.length === 0
          ? <EmptyState icon="calendar-outline" title="No events match" hint={when === 'week' ? 'Nothing is happening this week. Try All upcoming.' : 'Try a different category or clear the filters.'} />
          : events.map((e) => <EventCard key={e.id} event={e} onPress={() => navigation.navigate('EventDetail', { eventId: e.id })} />))}
      </Loadable>
    </Screen>
  );
}
