// components/common/InitialAvatar.tsx
import React from 'react';
import { View, Text, Image, ImageStyle, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { API_BASE_URL } from '../../constants/config';
import { fixImageUrl } from '../../lib/utils';

interface InitialAvatarProps {
    name: string;
    avatarUrl?: string | null;
    size?: number;
    fontSize?: number;
    style?: StyleProp<ViewStyle>;
    textStyle?: TextStyle;
    role?: 'patient' | 'optometrist' | 'other';
}

// Generate consistent color based on name
const getColorFromName = (name: string, role?: 'patient' | 'optometrist' | 'other'): string => {
    console.log('🎨 getColorFromName called:', { name, role });

    if (role === 'patient') {
        console.log('✅ Returning ORANGE for patient');
        return '#ea580c'; // Orange for patient
    }
    if (role === 'optometrist') {
        console.log('✅ Returning BLUE for optometrist');
        return '#2563EB'; // Blue for optometrist
    }

    console.log('⚠️ No role match, using random color');
    const colors = [
        '#2563EB', // Blue
        '#16a34a', // Green
        '#ea580c', // Orange
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#06b6d4', // Cyan
        '#f59e0b', // Amber
        '#6366f1', // Indigo
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name: string): string => {
    if (!name || name.trim() === '') return '?';

    const words = name.trim().split(' ').filter(w => w.length > 0);

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

export default function InitialAvatar({
    name,
    avatarUrl,
    size = 44,
    fontSize,
    style,
    textStyle,
    role,
}: InitialAvatarProps) {
    const resolvedUrl = fixImageUrl(avatarUrl || undefined);
    const [imageError, setImageError] = React.useState(false);

    // Reset error state when URL changes
    React.useEffect(() => {
        setImageError(false);
    }, [resolvedUrl]);

    // If there's a valid avatar URL and no error, show the image
    if (resolvedUrl && !imageError) {
        return (
            <Image
                source={{ uri: resolvedUrl }}
                style={[
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    } as ImageStyle,
                    style as any,
                ]}
                onError={() => {
                    console.log('Image load error for:', resolvedUrl);
                    setImageError(true);
                }}
            />
        );
    }

    // Otherwise, show initials
    const initials = getInitials(name);
    const backgroundColor = getColorFromName(name, role);
    const calculatedFontSize = fontSize || size * 0.4;

    console.log('🎨 InitialAvatar rendering initials:', {
        name,
        role,
        initials,
        backgroundColor,
    });

    return (
        <View
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                style,
            ]}
        >
            <Text
                style={[
                    {
                        color: '#fff',
                        fontSize: calculatedFontSize,
                        fontWeight: 'bold',
                    },
                    textStyle,
                ]}
            >
                {initials}
            </Text>
        </View>
    );
}
