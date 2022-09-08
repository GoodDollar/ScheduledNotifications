import Notifications from 'react-native-notifications';

export * from './apis.permissions'

// eslint-disable-next-line require-await
export const getInitialNotification = async () => Notifications.getInitialNotification()
