import React, {useCallback, useState} from 'react';
import {Text, View, Pressable, Switch} from 'react-native';
import {
  useNotificationsSupport,
  useNotificationsOptions,
  useNotifications,
} from './useNotifications';
import {styles} from './theme';

export const OptionsView = () => {
  const [enabled, toggleEnabled] = useNotificationsOptions();
  const [supported, unsupported] = useNotificationsSupport();

  if (unsupported) {
    return (
      <Text style={styles.text}>
        Notifications are not available on Your platform
      </Text>
    );
  }

  if (supported) {
    return (
      <>
        <Text style={styles.text}>Enable notifications</Text>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={enabled ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleEnabled}
          value={enabled}
        />
      </>
    );
  }

  return null;
};

export const NotificationsView = () => {
  const [notification, setNotification] = useState();
  const onDismiss = useCallback(() => setNotification(null), [setNotification]);

  const onOpened = useCallback(
    ({title, body}, category) => {
      setNotification({title, body, category});
      setTimeout(onDismiss, 5000);
    },
    [setNotification, onDismiss],
  );

  useNotifications(onOpened);

  if (!notification) {
    return null;
  }

  return (
    <>
      <Text style={styles.text}>
        You've tapped notification: {notification.title}
        {'\n'}
        {notification.body}
        {'\n'}@{notification.category}
      </Text>
      <Pressable
        onPress={onDismiss}
        style={styles.button}
        underlayColor={'#0A84D0'}>
        <View>
          <Text style={styles.buttonText}>Dismiss</Text>
        </View>
      </Pressable>
    </>
  );
};
