import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiClient from '../api/ApiClient';
import NotificationStore from '../stores/NotificationStore';
import * as authApi from '../api/authApi';

const TOKEN_KEY = 'bookt.token';
const api = ApiClient.getInstance();
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const signOut = useCallback(async () => {
    api.setToken(null);
    const store = NotificationStore.getInstance();
    store.stopPolling();
    store.reset();
    await AsyncStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    api.setUnauthorizedHandler(signOut);
    (async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          api.setToken(token);
          const { user: me } = await authApi.me();
          setUser(me);
        }
      } catch {
        /* an expired token is cleared by the 401 handler; offline keeps the sign-in screen */
      } finally {
        setBooting(false);
      }
    })();
  }, [signOut]);

  const establish = useCallback(async ({ user: u, token }) => {
    api.setToken(token);
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setUser(u);
  }, []);

  const value = useMemo(() => ({
    user,
    booting,
    can: (permission) => !!user?.permissions?.includes(permission),
    signIn: async (identifier, password, portal) => establish(await authApi.login(identifier, password, portal)),
    updateProfile: async (data) => { const { user: u } = await authApi.updateProfile(data); setUser(u); },
    register: async (data) => establish(await authApi.register(data)),
    signOut,
  }), [user, booting, establish, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
