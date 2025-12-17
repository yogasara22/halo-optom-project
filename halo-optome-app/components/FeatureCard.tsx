import { View, Text, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  desc: string;
};

export default function FeatureCard({ icon, title, desc }: FeatureCardProps) {
  return (
    <View style={styles.featureCard}>
      {icon}
      <View>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDesc}>{desc}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  featureDesc: {
    fontSize: 13,
    color: '#64748b',
  },
});
