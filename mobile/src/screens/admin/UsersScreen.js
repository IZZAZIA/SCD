import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Chips from '../../components/Chips';
import { EmptyState, Loadable } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as userApi from '../../api/userApi';
import { ROLES, ROLE_KEYS } from '../../config/constants';
import { colors } from '../../theme/theme';

const FILTERS = [{ value: 'all', label: 'Everyone' }, ...ROLE_KEYS.map((k) => ({ value: k, label: ROLES[k] }))];

export default function UsersScreen({ navigation }) {
  const [role, setRole] = useState('all');
  const state = useApi(() => userApi.list(), []);
  return (
    <Screen onRefresh={state.reload}>
      <Button title="Add a user" icon="person-add-outline" onPress={() => navigation.navigate('UserForm')} />
      <Chips options={FILTERS} value={role} onChange={setRole} />
      <Loadable state={state}>
        {(all) => {
          const users = role === 'all' ? all : all.filter((u) => u.role === role);
          if (users.length === 0) return <EmptyState icon="people-outline" title="No users in this group" />;
          return users.map((u) => (
            <Card key={u.id} onPress={() => navigation.navigate('UserForm', { user: u })} style={styles.card}>
              <View style={styles.avatar}><Text style={styles.initial}>{u.name.charAt(0).toUpperCase()}</Text></View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.name}>{u.name}</Text>
                <Text style={styles.meta}>{u.username ? `@${u.username}, ` : ''}{u.email}</Text>
                <Text style={styles.meta}>{ROLES[u.role]}</Text>
              </View>
              <Badge status={u.status} />
            </Card>
          ));
        }}
      </Loadable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#fff', fontWeight: '800', fontSize: 18 },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 13, color: colors.muted },
});
