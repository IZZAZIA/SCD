import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { EmptyState, Loadable, SectionTitle } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as registrationApi from '../../api/registrationApi';
import { notifyError } from '../../utils/dialogs';
import { colors } from '../../theme/theme';

export default function AttendeesScreen({ route }) {
  const { eventId } = route.params;
  const state = useApi(() => registrationApi.attendees(eventId), [eventId]);

  const toggle = async (row) => {
    try {
      await registrationApi.setAttendance(eventId, row.studentId, !row.attended);
      await state.reload();
    } catch (e) {
      notifyError(e);
    }
  };

  return (
    <Screen onRefresh={state.reload}>
      <Loadable state={state}>
        {(rows) => (
          <>
            <SectionTitle>{rows.filter((r) => r.attended).length} of {rows.length} marked present</SectionTitle>
            {rows.length === 0 ? <EmptyState title="No one has registered yet" /> : null}
            {rows.map((r) => (
              <Card key={r.id}>
                <View style={styles.row}>
                  <View style={{ flexShrink: 1 }}>
                    <Text style={styles.name}>{r.studentName}</Text>
                    <Text style={styles.meta}>{r.studentEmail}</Text>
                  </View>
                  <Button title={r.attended ? 'Present' : 'Mark present'} variant={r.attended ? 'primary' : 'secondary'} onPress={() => toggle(r)} />
                </View>
              </Card>
            ))}
          </>
        )}
      </Loadable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  meta: { fontSize: 14, color: colors.muted },
});
