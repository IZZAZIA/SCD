import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Button from './Button';
import TextField from './TextField';
import * as bookingApi from '../api/bookingApi';
import { confirmAction, notifyError } from '../utils/dialogs';

// FR-14: approve or reject a pending request with remarks (remarks are required for a rejection).
export default function ReviewActions({ booking, onDone }) {
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState(null);

  const act = async (decision) => {
    setBusy(decision);
    try {
      await bookingApi.review(booking.id, decision, remarks);
      onDone();
    } catch (e) {
      notifyError(e);
    } finally {
      setBusy(null);
    }
  };

  const cancelApproved = async () => {
    if (!(await confirmAction('Cancel this approved booking?', 'The organizer will be notified.', 'Cancel booking'))) return;
    try {
      await bookingApi.cancel(booking.id);
      onDone();
    } catch (e) {
      notifyError(e);
    }
  };

  if (booking.status === 'Approved') return <Button title="Cancel booking" variant="danger" onPress={cancelApproved} />;
  if (booking.status !== 'Pending') return null;

  return (
    <View style={styles.wrap}>
      <TextField label="Remarks" value={remarks} onChangeText={setRemarks} placeholder="Add a note for the organizer" autoCapitalize="sentences" />
      <View style={styles.row}>
        <Button title="Approve" style={styles.flex} onPress={() => act('approve')} loading={busy === 'approve'} disabled={!!busy} />
        <Button title="Reject" variant="danger" style={styles.flex} onPress={() => act('reject')} loading={busy === 'reject'} disabled={!!busy || !remarks.trim()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10, marginTop: 8 },
  row: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
});
