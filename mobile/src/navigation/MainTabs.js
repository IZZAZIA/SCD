import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';
import { createTabsForRole } from './tabFactory';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

function HeaderButtons({ navigation, unread, alerts }) {
  return (
    <View style={styles.buttons}>
      {alerts ? (
        <Pressable hitSlop={8} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name={unread > 0 ? 'notifications' : 'notifications-outline'} size={24} color="#fff" />
          {unread > 0 ? <View style={styles.badge}><Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text></View> : null}
        </Pressable>
      ) : null}
      <Pressable hitSlop={8} onPress={() => navigation.navigate('Profile')}>
        <Ionicons name="person-circle-outline" size={27} color="#fff" />
      </Pressable>
    </View>
  );
}

export default function MainTabs() {
  const { user, can } = useAuth();
  const { unread, store } = useNotifications();
  const alerts = can('notification.view'); // admins send notifications; they do not receive them

  useEffect(() => {
    if (!alerts) return undefined;
    store.startPolling(); // Observer store refreshes every 30s; the bell badge re-renders by itself
    return () => store.stopPolling();
  }, [store, alerts]);

  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => <HeaderButtons navigation={navigation} unread={unread} alerts={alerts} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#8A9BA2',
        tabBarStyle: { height: 64, paddingTop: 6, paddingBottom: 8, backgroundColor: '#fff', borderTopColor: colors.line },
        tabBarLabelStyle: { fontSize: 11.5, fontWeight: '600' },
      })}
    >
      {createTabsForRole(user.role).map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: tab.title,
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? tab.icon : `${tab.icon}-outline`} size={24} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  buttons: { flexDirection: 'row', alignItems: 'center', gap: 16, marginRight: 14 },
  badge: { position: 'absolute', top: -6, right: -8, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  badgeText: { fontSize: 10.5, fontWeight: '800', color: colors.ink },
});
