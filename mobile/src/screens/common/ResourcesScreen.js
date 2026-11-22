import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { EmptyState, Loadable } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import * as resourceApi from '../../api/resourceApi';
import { colors } from '../../theme/theme';

// FR-9: shows each resource's live availability.
export default function ResourcesScreen({ navigation }) {
  const { can } = useAuth();
  const state = useApi(() => resourceApi.list(), []);

  return (
    <Screen onRefresh={state.reload}>
      {can('resource.manage') ? <Button title="Add a resource" onPress={() => navigation.navigate('ResourceForm')} /> : null}
      <Loadable state={state}>
        {(resources) => (resources.length === 0
          ? <EmptyState title="No resources yet" hint="Add halls, labs and equipment so organizers can book them." />
          : resources.map((r) => (
            <Card key={r.id}>
              <View style={styles.top}>
                <Text style={styles.name}>{r.name}</Text>
                {r.status !== 'available'
                  ? <Badge status={r.status} label={r.status === 'maintenance' ? 'Under maintenance' : 'Unavailable'} />
                  : r.inUseNow ? <Badge status="inUse" label="In use now" /> : <Badge status="available" label="Available now" />}
              </View>
              <Text style={styles.meta}>{r.type}, {r.location}{r.capacity ? `, seats ${r.capacity}` : ''}</Text>
              <View style={styles.actions}>
                <Button title="View schedule" variant="secondary" style={styles.flex} onPress={() => navigation.navigate('ResourceAvailability', { resourceId: r.id })} />
                {can('resource.manage') ? <Button title="Edit" variant="secondary" style={styles.flex} onPress={() => navigation.navigate('ResourceForm', { resourceId: r.id })} /> : null}
              </View>
            </Card>
          )))}
      </Loadable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  name: { fontSize: 17, fontWeight: '700', color: colors.ink, flexShrink: 1 },
  meta: { fontSize: 14, color: colors.muted },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  flex: { flex: 1 },
});
