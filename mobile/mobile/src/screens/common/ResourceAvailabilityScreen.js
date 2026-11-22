import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import DateField from '../../components/DateField';
import { EmptyState, Loadable, SectionTitle } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as resourceApi from '../../api/resourceApi';
import { formatDate, timeOf, todayString } from '../../utils/format';
import { colors } from '../../theme/theme';

// FR-9: pick any day to see when a resource is taken.
export default function ResourceAvailabilityScreen({ route }) {
  const { resourceId } = route.params;
  const [date, setDate] = useState(todayString());
  const state = useApi(() => resourceApi.availability(resourceId, date), [resourceId, date]);

  return (
    <Screen onRefresh={state.reload}>
      <DateField label="Date" value={date} onChange={setDate} allowPast />
      <Loadable state={state}>
        {(data) => (
          <>
            <SectionTitle>{data.resource.name}, {formatDate(data.date)}</SectionTitle>
            {data.busySlots.length === 0
              ? <EmptyState icon="checkmark-circle-outline" title="Free all day" hint="No pending or approved bookings on this date." />
              : data.busySlots.map((s) => (
                <Card key={s.bookingId}>
                  <Text style={styles.time}>{timeOf(s.startTime)} to {timeOf(s.endTime)}</Text>
                  <Text style={styles.meta}>{s.eventTitle || 'Event'}</Text>
                  <Badge status={s.status} />
                </Card>
              ))}
          </>
        )}
      </Loadable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  time: { fontSize: 17, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 14, color: colors.muted },
});
