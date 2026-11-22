import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import useAuth from '../hooks/useAuth';
import MainTabs from './MainTabs';
import { colors } from '../theme/theme';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import EventDetailScreen from '../screens/student/EventDetailScreen';
import EventFormScreen from '../screens/organizer/EventFormScreen';
import RequestBookingScreen from '../screens/organizer/RequestBookingScreen';
import AttendeesScreen from '../screens/organizer/AttendeesScreen';
import ResourceFormScreen from '../screens/manager/ResourceFormScreen';
import ResourceAvailabilityScreen from '../screens/common/ResourceAvailabilityScreen';
import UserFormScreen from '../screens/admin/UserFormScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import NotificationsScreen from '../screens/common/NotificationsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import ResourcesScreen from '../screens/common/ResourcesScreen';
import SendReminderScreen from '../screens/admin/SendReminderScreen';

const Stack = createNativeStackNavigator();
const header = { headerStyle: { backgroundColor: colors.primary }, headerTintColor: '#fff' };

export default function RootNavigator() {
  const { user, booting } = useAuth();

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={header}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create account' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My profile' }} />
          <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event' }} />
          <Stack.Screen name="EventForm" component={EventFormScreen} options={{ title: 'Event details' }} />
          <Stack.Screen name="RequestBooking" component={RequestBookingScreen} options={{ title: 'Request resources' }} />
          <Stack.Screen name="Attendees" component={AttendeesScreen} options={{ title: 'Attendees' }} />
          <Stack.Screen name="ResourceForm" component={ResourceFormScreen} options={{ title: 'Resource' }} />
          <Stack.Screen name="ResourceAvailability" component={ResourceAvailabilityScreen} options={{ title: 'Availability' }} />
          <Stack.Screen name="UserForm" component={UserFormScreen} options={{ title: 'User' }} />
          <Stack.Screen name="ResourceBrowser" component={ResourcesScreen} options={{ title: 'Rooms and equipment' }} />
          <Stack.Screen name="SendReminder" component={SendReminderScreen} options={{ title: 'Send a reminder' }} />
          <Stack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
