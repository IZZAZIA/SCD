import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import { EmptyState, Loadable, SectionTitle } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as reportApi from '../../api/reportApi';
import { colors } from '../../theme/theme';

const Bar = ({ percent, color = colors.primary }) => (
  <View style={styles.track}><View style={[styles.fill, { width: `${Math.min(100, Math.max(2, percent))}%`, backgroundColor: color }]} /></View>
);

// Objective 6: resource utilization and event participation.
export default function ReportsScreen() {
  const state = useApi(async () => {
    const [utilization, participation] = await Promise.all([reportApi.utilization(), reportApi.participation()]);
    return { utilization, participation };
  }, []);

  return (
    <Screen onRefresh={state.reload}>
      <Loadable state={state}>
        {({ utilization, participation }) => {
          const maxHours = Math.max(1, ...utilization.map((u) => u.hoursBooked));
          return (
            <>
              <SectionTitle>Resource utilization</SectionTitle>
              {utilization.length === 0 ? <EmptyState title="No resources yet" /> : null}
              {utilization.map((u) => (
                <Card key={u.resourceId}>
                  <Text style={styles.name}>{u.name}</Text>
                  <Bar percent={(u.hoursBooked / maxHours) * 100} color={colors.gold} />
                  <Text style={styles.meta}>{u.hoursBooked} hours across {u.approvedBookings} approved booking(s), {u.pendingRequests} pending</Text>
                </Card>
              ))}

              <SectionTitle>Event participation</SectionTitle>
              {participation.length === 0 ? <EmptyState title="No events yet" /> : null}
              {participation.map((p) => (
                <Card key={p.eventId}>
                  <Text style={styles.name}>{p.title}</Text>
                  <Bar percent={p.fillRate} />
                  <Text style={styles.meta}>{p.registered} of {p.capacity} registered ({p.fillRate}% full), {p.attended} attended ({p.attendanceRate}%)</Text>
                </Card>
              ))}
            </>
          );
        }}
      </Loadable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 14, color: colors.muted },
  track: { height: 8, backgroundColor: colors.line, borderRadius: 4, overflow: 'hidden', marginVertical: 4 },
  fill: { height: 8, borderRadius: 4 },
});
