// app/checkout/index.tsx
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';

export default function CheckoutScreen() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    clearCart();
    router.push('/checkout/success');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>

      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.quantity} x Rp {item.price.toLocaleString('id-ID')}</Text>
          </View>
        )}
      />

      <Text style={styles.total}>Total: Rp {total.toLocaleString('id-ID')}</Text>

      <TouchableOpacity style={styles.button} onPress={handleCheckout}>
        <Text style={styles.buttonText}>Bayar Sekarang</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  name: { fontWeight: 'bold' },
  total: { fontSize: 18, fontWeight: 'bold', marginTop: 24, color: '#2563EB' },
  button: { backgroundColor: '#2563EB', padding: 16, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
