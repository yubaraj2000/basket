import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import {
  addItem,
  getHousehold,
  getItems,
  getMembers,
  setItemDone,
  subscribeToItems,
  type Household,
  type Item,
  type Member,
} from '@/lib/household';
import { notify } from '@/lib/notify';
import { loadHouseholdId, loadName } from '@/lib/storage';
import { colors, layout, radius, space, type } from '@/theme';

/** Screen 2 · List: the household's shared list, updated live on every phone. */
export default function ListScreen() {
  const [myName, setMyName] = useState('');
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');

  // 1. Load everything once, then 2. listen for live changes from other phones.
  useEffect(() => {
    let stopListening: (() => void) | undefined;

    (async () => {
      try {
        const [name, householdId] = await Promise.all([loadName(), loadHouseholdId()]);
        if (!householdId) {
          router.replace('/');
          return;
        }
        setMyName(name);
        const [h, m, list] = await Promise.all([
          getHousehold(householdId),
          getMembers(householdId),
          getItems(householdId),
        ]);
        setHousehold(h);
        setMembers(m);
        setItems(list);

        stopListening = subscribeToItems(householdId, (event, row) => {
          setItems((current) => {
            if (event === 'DELETE') return current.filter((i) => i.id !== row.id);
            const updated = row as Item;
            const exists = current.some((i) => i.id === updated.id);
            return exists
              ? current.map((i) => (i.id === updated.id ? updated : i))
              : [...current, updated];
          });
        });
      } catch (e) {
        notify('Could not load the list', e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();

    return () => stopListening?.();
  }, []);

  const toBuy = useMemo(() => items.filter((i) => !i.done), [items]);
  const bought = useMemo(
    () =>
      items
        .filter((i) => i.done)
        .sort((a, b) => (b.done_at ?? '').localeCompare(a.done_at ?? '')),
    [items]
  );
  const progress = items.length > 0 ? bought.length / items.length : 0;

  async function toggle(item: Item) {
    const done = !item.done;
    // Update the screen straight away; the database and other phones catch up a moment later.
    setItems((current) =>
      current.map((i) =>
        i.id === item.id
          ? { ...i, done, done_by_name: done ? myName : null, done_at: done ? new Date().toISOString() : null }
          : i
      )
    );
    try {
      await setItemDone(item, done, myName);
    } catch (e) {
      setItems((current) => current.map((i) => (i.id === item.id ? item : i)));
      notify('Could not update', e instanceof Error ? e.message : String(e));
    }
  }

  async function handleAdd() {
    if (!household || newName.trim().length === 0) return;
    const name = newName;
    const qty = newQty;
    setNewName('');
    setNewQty('');
    try {
      await addItem(household.id, name, qty, myName);
    } catch (e) {
      setNewName(name);
      setNewQty(qty);
      notify('Could not add the item', e instanceof Error ? e.message : String(e));
    }
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Push the add-item bar up when the keyboard opens. */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.appbar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} style={styles.iconButton}>
            <Icon name="back" size={18} />
          </Pressable>
          <View style={styles.flex}>
            <Text style={styles.title}>{household?.name ?? 'Our Home'}</Text>
            <View style={styles.subRow}>
              <View style={styles.dot} />
              <Text style={styles.sub}>
                {members.length} {members.length === 1 ? 'member' : 'members'} · live
              </Text>
            </View>
          </View>
          {household ? (
            <View style={styles.codeChip}>
              <Text style={styles.codeLabel}>Code</Text>
              <Text style={styles.codeText}>{household.invite_code}</Text>
            </View>
          ) : null}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.progress}>
            <View style={styles.progressTop}>
              <Text style={styles.progressText}>
                <Text style={styles.progressStrong}>
                  {bought.length} of {items.length}
                </Text>{' '}
                bought
              </Text>
              <Text style={styles.progressText}>{toBuy.length} left</Text>
            </View>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
          </View>

          <Text style={styles.section}>To buy · {toBuy.length}</Text>
          <View style={styles.card}>
            {toBuy.length === 0 ? (
              <Text style={styles.empty}>Nothing to buy. Add the first item below.</Text>
            ) : (
              toBuy.map((item) => (
                <ItemRow key={item.id} item={item} myName={myName} onToggle={() => toggle(item)} />
              ))
            )}
          </View>

          {bought.length > 0 ? (
            <>
              <Text style={styles.section}>Bought · {bought.length}</Text>
              <View style={styles.card}>
                {bought.map((item) => (
                  <ItemRow key={item.id} item={item} myName={myName} onToggle={() => toggle(item)} />
                ))}
              </View>
            </>
          ) : null}
        </ScrollView>

        <View style={styles.addBar}>
          <TextInput
            style={[styles.addInput, styles.flex]}
            value={newName}
            onChangeText={setNewName}
            placeholder="Add an item, e.g. Milk"
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
          <TextInput
            style={[styles.addInput, styles.qtyInput]}
            value={newQty}
            onChangeText={setNewQty}
            placeholder="Qty"
            placeholderTextColor={colors.muted}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add item"
            onPress={handleAdd}
            disabled={newName.trim().length === 0}
            style={({ pressed }) => [
              styles.addButton,
              (pressed || newName.trim().length === 0) && { opacity: 0.6 },
            ]}>
            <Icon name="plus" size={22} color={colors.surface} strokeWidth={2.4} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** One row: a tick box, the item name and who added (or bought) it. */
function ItemRow({ item, myName, onToggle }: { item: Item; myName: string; onToggle: () => void }) {
  const who = (n: string | null) => (n && n === myName ? 'you' : n || 'someone');
  const meta = item.done
    ? `${item.quantity ? `${item.quantity} · ` : ''}ticked by ${who(item.done_by_name)}${timeAgo(item.done_at)}`
    : `${item.quantity ? `${item.quantity} · ` : ''}added by ${who(item.added_by_name)}`;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.done }}
      onPress={onToggle}
      style={styles.row}>
      <View style={[styles.check, item.done && styles.checkDone]}>
        {item.done ? <Icon name="check" size={14} color={colors.surface} strokeWidth={3} /> : null}
      </View>
      <View style={styles.flex}>
        <Text style={[styles.itemName, item.done && styles.itemNameDone]}>{item.name}</Text>
        <Text style={styles.itemMeta}>{meta}</Text>
      </View>
    </Pressable>
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return ', just now';
  if (minutes < 60) return `, ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `, ${hours} h ago` : '';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
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
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  sub: { ...type.caption, color: colors.muted },
  codeChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  codeLabel: { ...type.caption, fontSize: 11, lineHeight: 14, color: colors.muted },
  codeText: { ...type.label, color: colors.text, letterSpacing: 0.5 },
  scroll: { paddingBottom: space[5] },
  progress: { marginHorizontal: layout.screenMargin, marginTop: space[2] },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space[1] },
  progressText: { ...type.caption, color: colors.muted },
  progressStrong: { fontFamily: type.label.fontFamily, color: colors.text },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  section: {
    ...type.label,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 18,
    marginBottom: space[1],
    marginHorizontal: layout.screenMargin,
  },
  card: {
    marginHorizontal: layout.screenMargin,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    overflow: 'hidden',
  },
  empty: { ...type.caption, color: colors.muted, padding: space[3] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: radius.checkbox,
    borderWidth: 2,
    borderColor: '#BDB8AE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  itemName: { ...type.bodyStrong, color: colors.text },
  itemNameDone: {
    fontFamily: type.body.fontFamily,
    color: colors.muted,
    textDecorationLine: 'line-through',
  },
  itemMeta: { ...type.caption, color: colors.muted, marginTop: 2 },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    paddingHorizontal: layout.screenMargin,
    paddingVertical: space[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  addInput: {
    height: 48,
    borderRadius: radius.button,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    paddingHorizontal: 14,
    ...type.body,
    color: colors.text,
  },
  qtyInput: { width: 76 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: radius.button,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
