import React from 'react';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import BookingCard from '../../components/BookingCard';
import { EmptyState, Loadable } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as bookingApi from '../../api/bookingApi';
import { confirmAction, notifyError } from '../../utils/dialogs';

// FR-15: organizers track the status of every request at any time.
export default function MyBookingsScreen() {
  const state = useApi(() => bookingApi.mine(), []);

  const cancel = async (b) => {
    if (!(await confirmAction('Cancel this request?', `${b.resourceName} for ${b.eventTitle}`, 'Cancel request'))) return;
    try {
      await bookingApi.cancel(b.id);
      await state.reload();
    } catch (e) {
      notifyError(e);
    }
  };

  return (
    <Screen onRefresh={state.reload}>
      <Loadable state={state}>
        {(bookings) => (bookings.length === 0
          ? <EmptyState title="No booking requests" hint="Open one of your events and choose Request resources." />
          : bookings.map((b) => (
            <BookingCard key={b.id} booking={b}>
              {b.status === 'Pending' || b.status === 'Approved'
                ? <Button title="Cancel request" variant="danger" onPress={() => cancel(b)} />
                : null}
            </BookingCard>
          )))}
      </Loadable>
    </Screen>
  );
}
