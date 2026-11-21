import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Icon } from '@/components/icon';
import { TextField } from '@/components/text-field';
import { createHousehold, joinHousehold } from '@/lib/household';
import { notify } from '@/lib/notify';
import { loadHouseholdId, loadName, saveHouseholdId, saveName } from '@/lib/storage';
import { colors, layout, radius, space, type } from '@/theme';

/** Screen 1 · Welcome: enter your name, then create a household list or join one with its code. */
export default function WelcomeScreen() {
  const [name, setName] = useState('');
  const [invite, setInvite] = useState('');
  const [busy, setBusy] = useState<'create' | 'join' | null>(null);
  const [hasSavedList, setHasSavedList] = useState(false);

  // When the screen opens, fill in the saved name and check if this phone already has a list.
  useEffect(() => {
    loadName().then(setName);
    loadHouseholdId().then((id) => setHasSavedList(Boolean(id)));
  }, []);

  const hasName = name.trim().length > 0;
  const canJoin = hasName && invite.trim().length > 0 && busy === null;

  async function handleCreate() {
    setBusy('create');
    try {
      await saveName(name);
      const household = await createHousehold(name.trim());
      await saveHouseholdId(household.id);
      router.push('/list');
    } catch (e) {
      notify('Could not create the list', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleJoin() {
    setBusy('join');
    try {
      await saveName(name);
      const household = await joinHousehold(invite, name.trim());
      await saveHouseholdId(household.id);
      router.push('/list');
    } catch (e) {
      notify('Could not join', e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Push the content up when the keyboard opens, so buttons are never hidden behind it. */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
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
            {hasSavedList ? (
              <View style={styles.savedCard}>
                <Text style={styles.savedText}>This phone already has a list.</Text>
                <Button title="Open my list" onPress={() => router.push('/list')} />
              </View>
            ) : null}

            <TextField
              label="Your name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ananya"
              autoCapitalize="words"
              returnKeyType="done"
            />
            <Button
              title={busy === 'create' ? 'Creating…' : 'Create a household list'}
              variant={hasSavedList ? 'secondary' : 'primary'}
              onPress={handleCreate}
              disabled={!hasName || busy !== null}
            />

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
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={() => {
                if (canJoin) handleJoin();
              }}
            />
            {invite.trim().length > 0 && !hasName ? (
              <Text style={styles.hint}>Enter your name above first.</Text>
            ) : null}
            <Button
              title={busy === 'join' ? 'Joining…' : 'Join list'}
              variant="secondary"
              onPress={handleJoin}
              disabled={!canJoin}
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
  savedCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    padding: space[3],
    gap: space[2],
    marginBottom: space[1],
  },
  savedText: { ...type.bodyStrong, color: colors.primaryInk },
  divider: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginVertical: 6 },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { ...type.caption, color: colors.muted },
  hint: { ...type.caption, color: colors.danger, marginTop: -6 },
  foot: {
    ...type.caption,
    color: colors.muted,
    textAlign: 'center',
    paddingTop: space[4],
    paddingHorizontal: layout.screenMargin + space[3],
  },
});
