import { Alert, Platform } from 'react-native';

export function notify(title, message) {
  if (Platform.OS === 'web') window.alert(message ? `${title}\n${message}` : title);
  else Alert.alert(title, message);
}

export const notifyError = (err) => notify('That did not work', err?.message || 'Try again in a moment.');

export function confirmAction(title, message, confirmLabel = 'Confirm') {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(window.confirm(`${title}\n${message || ''}`));
      return;
    }
    Alert.alert(
      title,
      message,
      [
        { text: 'Keep', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
