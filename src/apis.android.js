import Notifications from 'react-native-notifications';

export * from './apis.common';

export const getInitialNotification = async () =>
  Notifications.getInitialNotification();
