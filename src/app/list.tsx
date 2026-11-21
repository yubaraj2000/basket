import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { loadName } from '@/lib/storage';
import { colors, layout, radius, space, type } from '@/theme';

/**
 * Screen 2 · List (placeholder).
 * For now it only proves navigation and saved data work: it reads the name
 * saved on the Welcome screen. The real shared list arrives in step 4.
 */
export default function ListScreen() {
  const [name, setName] = useState('');

  useEffect(() => {
    loadName().then(setName);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.appbar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={styles.iconButton}>
          <Icon name="back" size={18} />
        </Pressable>
        <Text style={styles.title}>Our Home</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.hello}>Hi {name || 'there'} 👋</Text>
        <Text style={styles.body}>
          Your name was saved on this phone and read back on this screen. The shared list, synced
          live between phones, arrives in step 4.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  appbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: layout.screenMargin,
    paddingTop: space[1],
    paddingBottom: space[2],
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...type.title, color: colors.text },
  card: {
    margin: layout.screenMargin,
    padding: space[4],
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space[2],
  },
  hello: { ...type.heading, color: colors.text },
  body: { ...type.body, color: colors.muted },
});
