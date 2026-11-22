import React, { useEffect, useState } from 'react';
import Screen from '../../components/Screen';
import Chips from '../../components/Chips';
import BookingCard from '../../components/BookingCard';
import ReviewActions from '../../components/ReviewActions';
import { EmptyState, Loadable } from '../../components/StateViews';
import useApi from '../../hooks/useApi';
import * as bookingApi from '../../api/bookingApi';

const FILTERS = ['Pending', 'Approved', 'Rejected', 'Cancelled', 'All'];

// FR-13/14: resource managers and admins review requests.
export default function BookingRequestsScreen({ route }) {
  const [status, setStatus] = useState(route?.params?.status || 'Pending');
  // Home tiles can open this tab on a specific status.
  useEffect(() => { if (route?.params?.status) setStatus(route.params.status); }, [route?.params?.status]);
  const state = useApi(() => bookingApi.all(status === 'All' ? undefined : status), [status]);

  return (
    <Screen onRefresh={state.reload}>
      <Chips options={FILTERS} value={status} onChange={setStatus} />
      <Loadable state={state}>
        {(bookings) => (bookings.length === 0
          ? <EmptyState title={status === 'Pending' ? 'No requests waiting' : `No ${status.toLowerCase()} requests`} />
          : bookings.map((b) => (
            <BookingCard key={b.id} booking={b} showRequester>
              <ReviewActions booking={b} onDone={state.reload} />
            </BookingCard>
          )))}
      </Loadable>
    </Screen>
  );
}
