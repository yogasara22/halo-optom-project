import { Tabs } from 'expo-router';
import { Home, User } from 'lucide-react-native';
import { useColorScheme } from 'react-native';

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
                    borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderTopWidth: 1,
                    paddingBottom: 6,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    // tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profil',
                    // tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tabs>
    );
}
