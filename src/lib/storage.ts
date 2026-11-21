import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Saving small things on the phone itself.
 *
 * AsyncStorage is a simple key → value store that survives closing the app.
 * It is not encrypted, so never put passwords or secrets in it.
 */
const NAME_KEY = 'basket:name';

export async function loadName(): Promise<string> {
  return (await AsyncStorage.getItem(NAME_KEY)) ?? '';
}

export async function saveName(name: string): Promise<void> {
  await AsyncStorage.setItem(NAME_KEY, name.trim());
}
