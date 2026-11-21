import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { TextField } from '@/components/text-field';
import { loadName, saveName } from '@/lib/storage';
import { colors, layout, space, type } from '@/theme';

/** Screen 1 · Welcome: enter your name, then create a household list or join one. */
export default function WelcomeScreen() {
  const [name, setName] = useState('');
  const [invite, setInvite] = useState('');

  // When the screen opens, fill in the name saved last time (if any).
  useEffect(() => {
    loadName().then(setName);
  }, []);

  const hasName = name.trim().length > 0;

  async function handleCreate() {
    await saveName(name);
    router.push('/list');
  }

  async function handleJoin() {
    await saveName(name);
    Alert.alert('Coming soon', 'Joining a list with a link or code arrives in step 6.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <View style={styles.heroCircle}>
              <Icon name="basket" size={60} color={colors.primary} strokeWidth={1.8} />
            </View>
            <Text style={styles.title}>Basket</Text>
            <Text style={styles.subtitle}>
              One shopping list for the whole home. Add things, and watch them get ticked off live,
              on every phone.
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="Your name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ananya"
              autoCapitalize="words"
              returnKeyType="done"
            />
            <Button title="Create a household list" onPress={handleCreate} disabled={!hasName} />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>or join one</Text>
              <View style={styles.line} />
            </View>

            <TextField
              icon="link"
              value={invite}
              onChangeText={setInvite}
              placeholder="Paste invite link or code"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              title="Join list"
              variant="secondary"
              onPress={handleJoin}
              disabled={!hasName || invite.trim().length === 0}
            />
          </View>

          <Text style={styles.foot}>No sign-up. Your name is saved only on this phone.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: space[6] },
  hero: { alignItems: 'center', paddingTop: 56, paddingHorizontal: space[6], paddingBottom: 28 },
  heroCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[5],
  },
  title: { ...type.display, color: colors.text },
  subtitle: {
    ...type.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 320,
  },
  form: { paddingHorizontal: space[5], gap: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginVertical: 6 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { ...type.caption, color: colors.muted },
  foot: {
    ...type.caption,
    color: colors.muted,
    textAlign: 'center',
    paddingTop: space[4],
    paddingHorizontal: layout.screenMargin + space[3],
  },
});
