// DESIGN PATTERN: FACTORY (client side)
// createTabsForRole() returns the tab set for a role, so adding a role or a tab never touches the navigator.
import DashboardScreen from '../screens/common/DashboardScreen';
import ResourcesScreen from '../screens/common/ResourcesScreen';
import EventListScreen from '../screens/student/EventListScreen';
import MyRegistrationsScreen from '../screens/student/MyRegistrationsScreen';
import MyEventsScreen from '../screens/organizer/MyEventsScreen';
import MyBookingsScreen from '../screens/organizer/MyBookingsScreen';
import BookingRequestsScreen from '../screens/manager/BookingRequestsScreen';
import UsersScreen from '../screens/admin/UsersScreen';

const home = { name: 'Home', label: 'Home', title: 'BOOKT', icon: 'home', component: DashboardScreen };
const events = { name: 'Events', label: 'Events', title: 'Events', icon: 'calendar', component: EventListScreen };
const resources = { name: 'Resources', label: 'Resources', title: 'Resources', icon: 'business', component: ResourcesScreen };
const requests = { name: 'Requests', label: 'Requests', title: 'Booking requests', icon: 'clipboard', component: BookingRequestsScreen };

const myEvents = { name: 'MyEvents', label: 'My events', title: 'My events', icon: 'create', component: MyEventsScreen };
const bookings = { name: 'Bookings', label: 'My requests', title: 'My room requests', icon: 'clipboard', component: MyBookingsScreen };

// Students also act for their society: they create events and request rooms, so they get those tabs.
const TABS = {
  student: [home, events, myEvents, bookings, { name: 'Registered', label: 'Joined', title: 'Events I joined', icon: 'bookmark', component: MyRegistrationsScreen }],
  organizer: [home, events, myEvents, resources, bookings],
  resource_manager: [home, requests, resources, events],
  admin: [home, { name: 'Users', label: 'Users', title: 'Users', icon: 'people', component: UsersScreen }, events, resources, requests],
};

export const createTabsForRole = (role) => TABS[role] || TABS.student;
