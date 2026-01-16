import { View, Text, StyleSheet } from 'react-native';

export default function ScheduleScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Jadwal Saya</Text>
            <Text style={styles.subText}>Halaman belum tersedia</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    subText: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748b',
    },
});
