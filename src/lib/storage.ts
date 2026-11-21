import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Saving small things on the phone itself.
 *
 * AsyncStorage is a simple key → value store that survives closing the app.
 * It is not encrypted, so never put passwords or secrets in it.
 */
const NAME_KEY = 'basket:name';
const HOUSEHOLD_KEY = 'basket:household';

export async function loadName(): Promise<string> {
  return (await AsyncStorage.getItem(NAME_KEY)) ?? '';
}

export async function saveName(name: string): Promise<void> {
  await AsyncStorage.setItem(NAME_KEY, name.trim());
}

/** The household (list) this phone last opened, so the app can go straight back to it. */
export async function loadHouseholdId(): Promise<string | null> {
  return AsyncStorage.getItem(HOUSEHOLD_KEY);
}

export async function saveHouseholdId(id: string): Promise<void> {
  await AsyncStorage.setItem(HOUSEHOLD_KEY, id);
}
