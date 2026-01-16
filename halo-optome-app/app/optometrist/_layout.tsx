import { Tabs } from 'expo-router';
import { Home, User, Calendar, MessageSquare, BriefcaseMedical } from 'lucide-react-native';
import { useColorScheme, Platform } from 'react-native';

export default function OptometristLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#16a34a', // Green theme for Optometrist
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: isDark ? '#0f172a' : '#fff',
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: -4 },
                    paddingBottom: 45,
                    paddingTop: 12,
                    height: 105,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    position: 'absolute',
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 5,
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="schedule"
                options={{
                    title: 'Jadwal Saya',
                    tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="consultation"
                options={{
                    title: 'Konsultasi',
                    tabBarIcon: ({ color, size }) => <MessageSquare size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="homecare"
                options={{
                    title: 'Homecare',
                    tabBarIcon: ({ color, size }) => <BriefcaseMedical size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="appointment/[id]"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }, // Hide bottom navigation on this screen
                }}
            />
        </Tabs>
    );
}
