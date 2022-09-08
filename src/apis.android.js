import Notifications from 'react-native-notifications';

export * from './apis.permissions';

export const getInitialNotification = async () =>
  Notifications.getInitialNotification();
