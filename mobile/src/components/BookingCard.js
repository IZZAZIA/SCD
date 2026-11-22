import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import Badge from './Badge';
import InfoRow from './InfoRow';
import { colors } from '../theme/theme';
import { formatSlot } from '../utils/format';

export default function BookingCard({ booking, showRequester, children }) {
  return (
    <Card>
      <View style={styles.top}>
        <Text style={styles.title}>{booking.resourceName || 'Removed resource'}</Text>
        <Badge status={booking.status} />
      </View>
      <InfoRow icon="calendar-outline" text={booking.eventTitle || 'A removed event'} />
      <InfoRow icon="time-outline" text={formatSlot(booking.startTime, booking.endTime)} />
      {showRequester ? <InfoRow icon="person-outline" text={`Requested by ${booking.requesterName}`} /> : null}
      {booking.remarks ? <InfoRow icon="chatbubble-ellipses-outline" text={booking.remarks} color={colors.ink} /> : null}
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink, flexShrink: 1 },
});
