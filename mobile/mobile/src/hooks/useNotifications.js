import { useEffect, useState } from 'react';
import NotificationStore from '../stores/NotificationStore';

export default function useNotifications() {
  const store = NotificationStore.getInstance();
  const [state, setState] = useState(store.state);
  useEffect(() => store.subscribe(setState), [store]);
  return { ...state, store };
}
