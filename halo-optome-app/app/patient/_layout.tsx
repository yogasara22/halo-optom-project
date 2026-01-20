import { Tabs } from 'expo-router';
import { Home, Calendar, ShoppingBag, User, Clock } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PatientLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#2563EB',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: isDark ? '#0f172a' : '#fff',
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: -4 },
                    paddingBottom: insets.bottom,
                    paddingTop: 10,
                    height: 60 + insets.bottom,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    position: 'absolute',
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: 5,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Beranda',
                    tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    title: 'Jadwal',
                    tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="booking"
                options={{
                    title: 'Booking',
                    tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="shop"
                options={{
                    title: 'Toko',
                    tabBarIcon: ({ color, size }) => <ShoppingBag color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="cart"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' },
                }}
            />


            <Tabs.Screen
                name="optometrist/[id]"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }, // Hide bottom navigation on this screen
                }}
            />
            <Tabs.Screen
                name="item/[id]"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }, // Hide bottom navigation on this screen
                }}
            />
            <Tabs.Screen
                name="product/[id]"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }, // Hide bottom navigation on this screen
                }}
            />
            <Tabs.Screen
                name="appointment/[id]"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }, // Hide bottom navigation on this screen
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' },
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' },
                }}
            />
        </Tabs>
    );
}
