import { Alert, Platform } from 'react-native';

/** Show a simple message. React Native's Alert does nothing on the web, so use the browser's alert there. */
export function notify(title: string, message: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}
