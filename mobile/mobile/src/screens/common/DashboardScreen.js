import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import { Loadable } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import * as reportApi from '../../api/reportApi';
import { ROLES } from '../../config/constants';
import { colors, radius } from '../../theme/theme';

const STAT_ICONS = {
  thisWeek: 'calendar', registered: 'bookmark', myevents: 'create', pending: 'time', approved: 'checkmark-circle',
  resources: 'business', offline: 'construct', users: 'people', registrations: 'ticket',
};

// Where each tile leads, per role: [tab name, params]. Every target exists in that role's tabs (see tabFactory).
function tileTarget(role, key) {
  const requester = role === 'student' || role === 'organizer';
  switch (key) {
    case 'thisWeek': return ['Events', { week: 'current' }];
    case 'registered': return ['Registered'];
    case 'myevents': return ['MyEvents'];
    case 'pending': return requester ? ['Bookings'] : ['Requests', { status: 'Pending' }];
    case 'approved': return requester ? ['Bookings'] : ['Requests', { status: 'Approved' }];
    case 'resources': case 'offline': return ['Resources'];
    case 'users': return ['Users'];
    case 'registrations': return ['Events'];
    default: return null;
  }
}

function Action({ icon, title, subtitle, onPress }) {
  return (
    <Card onPress={onPress} style={styles.action}>
      <View style={styles.actionIcon}><Ionicons name={icon} size={22} color={colors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.actionSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Card>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user, can } = useAuth();
  const state = useApi(() => reportApi.dashboard(), []);
  const requester = can('booking.request');

  return (
    <Screen onRefresh={state.reload}>
      <View style={styles.hero}>
        <Text style={styles.hello}>Hello, {user.name.split(' ')[0]}</Text>
        <Text style={styles.role}>{ROLES[user.role]}</Text>
      </View>

      <Loadable state={state}>
        {(data) => (
          <View style={styles.grid}>
            {data.stats.map((s) => {
              const target = tileTarget(user.role, s.key);
              return (
                <Pressable
                  key={s.key}
                  disabled={!target}
                  onPress={() => navigation.navigate(target[0], target[1])}
                  style={({ pressed }) => [styles.tile, pressed && { opacity: 0.8 }]}
                  accessibilityRole="button"
                  accessibilityLabel={`${s.label}: ${s.value}. Open`}
                >
                  <View style={styles.tileTop}>
                    <Ionicons name={STAT_ICONS[s.key] || 'stats-chart'} size={22} color={colors.gold} />
                    <Text style={styles.value}>{s.value}</Text>
                  </View>
                  <View style={styles.tileBottom}>
                    <Text style={styles.label}>{s.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </Loadable>

      {requester ? <Action icon="business-outline" title="Request a room or equipment" subtitle="Pick one of your events, then choose resources" onPress={() => navigation.navigate('MyEvents')} /> : null}
      {requester ? <Action icon="search-outline" title="Check room availability" subtitle="See what is free before you request" onPress={() => navigation.navigate('ResourceBrowser')} /> : null}
      {can('event.create') ? <Action icon="add-circle-outline" title="Create an event" subtitle="Set the society, date, venue and capacity" onPress={() => navigation.navigate('EventForm')} /> : null}
      {can('reminder.send') ? <Action icon="send-outline" title="Send a reminder" subtitle="Notify students about an event" onPress={() => navigation.navigate('SendReminder')} /> : null}
      {can('report.view') ? <Action icon="stats-chart-outline" title="Reports" subtitle="Resource utilization and event participation" onPress={() => navigation.navigate('Reports')} /> : null}
      {can('notification.view') ? <Action icon="notifications-outline" title="Notifications" subtitle="Approvals, reminders and schedule changes" onPress={() => navigation.navigate('Notifications')} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primary, borderRadius: 14, padding: 20, gap: 2 },
  hello: { fontSize: 26, fontWeight: '800', color: '#fff' },
  role: { fontSize: 15, color: colors.gold, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexBasis: '47%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 4 },
  tileTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tileBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 4 },
  value: { fontSize: 30, fontWeight: '800', color: colors.primary },
  label: { fontSize: 14, color: colors.muted, flexShrink: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0F2', alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 16, fontWeight: '700', color: colors.ink },
  actionSub: { fontSize: 13, color: colors.muted },
});
