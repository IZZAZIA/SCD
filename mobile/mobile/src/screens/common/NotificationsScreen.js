import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { EmptyState } from '../../components/StateViews';
import useNotifications from '../../hooks/useNotifications';
import { formatDateTime } from '../../utils/format';
import { notifyError } from '../../utils/dialogs';
import { colors } from '../../theme/theme';

export default function NotificationsScreen() {
  const { items, unread, store } = useNotifications(); // Observer: re-renders whenever the store changes
  useFocusEffect(useCallback(() => { store.refresh(); }, [store]));

  const open = (n) => (n.isRead ? null : store.markRead(n.id).catch(notifyError));

  return (
    <Screen onRefresh={() => store.refresh()}>
      {unread > 0 ? <Button title={`Mark ${unread} as read`} variant="secondary" onPress={() => store.markAllRead().catch(notifyError)} /> : null}
      {items.length === 0 ? <EmptyState title="Nothing new" hint="Approvals, reminders and schedule changes will show up here." /> : null}
      {items.map((n) => (
        <Card key={n.id} onPress={() => open(n)} style={!n.isRead && styles.unread}>
          <Text style={[styles.message, !n.isRead && { fontWeight: '700' }]}>{n.message}</Text>
          <View><Text style={styles.time}>{formatDateTime(n.createdAt)}</Text></View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  unread: { borderLeftWidth: 4, borderLeftColor: colors.gold },
  message: { fontSize: 15, color: colors.ink },
  time: { fontSize: 13, color: colors.muted },
});
