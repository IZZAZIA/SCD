import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import Badge from './Badge';
import InfoRow from './InfoRow';
import { colors } from '../theme/theme';
import { formatDate, formatTimeRange } from '../utils/format';

export default function EventCard({ event, onPress }) {
  const full = event.seatsLeft === 0;
  return (
    <Card onPress={onPress}>
      <View style={styles.top}>
        <Text style={styles.title}>{event.title}</Text>
        {event.status === 'Cancelled' ? <Badge status="Cancelled" /> : <Badge status="Scheduled" label={event.type} />}
      </View>
      <InfoRow icon="calendar-outline" text={`${formatDate(event.date)}, ${formatTimeRange(event.startTime, event.endTime)}`} />
      <InfoRow icon="location-outline" text={event.venue + (event.society ? `, ${event.society}` : '')} />
      <InfoRow icon="people-outline" text={full ? 'Full' : `${event.seatsLeft} of ${event.capacity} seats left`} color={full ? colors.danger : colors.muted} />
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink, flexShrink: 1 },
});
