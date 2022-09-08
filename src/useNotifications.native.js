import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Notifications} from 'react-native-notifications';
import PushNotification from 'react-native-push-notification';

import usePermissions from './usePermissions';
import {Permissions} from './types';
import {useUserStorage} from './useUserStorage';
import Config from './config';
import {noop} from './utils';
import {getInitialNotification} from './apis';

export const notificationsAvailable = true;

const {notificationTime, notificationSchedule} = Config;
const CHANNEL_ID = 'org.gooddollar.notifications.claim';

const NOTIFICATION = {
  title: "It's that time of the day 💸 💙",
  message: 'Claim your free GoodDollars now. It takes 10 seconds.',
};

const getScheduleId = userStorage => {
  if (!userStorage) {
    return null;
  }

  return userStorage.userProperties.getLocal('notificationsScheduleId');
};

const getCategory = notification => {
  const {payload} = notification || {};
  const {category} = payload || {};

  return category;
};

export const useNotificationsOptions = () => {
  const userStorage = useUserStorage();
  const [scheduleId, setScheduleId] = useState(() =>
    getScheduleId(userStorage),
  );
  const enabled = useMemo(() => !!scheduleId, [scheduleId]);

  const updateState = useCallback(
    value => {
      let newScheduleId = null;

      if (scheduleId) {
        PushNotification.cancelLocalNotification(scheduleId);
      }

      if (value === true) {
        newScheduleId = Math.floor(Math.random() * Math.pow(2, 32));
        PushNotification.localNotificationSchedule({
          ...NOTIFICATION,
          id: newScheduleId,
          channelId: CHANNEL_ID,
          date: notificationTime,
          repeatType: notificationSchedule,
          userInfo: {
            category: CHANNEL_ID,
            ...NOTIFICATION,
          },
        });
      }

      setScheduleId(newScheduleId);
      userStorage.userProperties.safeSet(
        'notificationsScheduleId',
        newScheduleId,
      );
    },
    [scheduleId, setScheduleId, userStorage],
  );

  const onAllowed = useCallback(() => updateState(true), [updateState]);
  const [allowed, requestPermission] = usePermissions(
    Permissions.Notifications,
    {
      requestOnMounted: false,
      onAllowed,
    },
  );

  const toggleEnabled = useCallback(
    newState => {
      if (newState === enabled) {
        return;
      }

      if (newState && !allowed) {
        requestPermission();
        return;
      }

      updateState(newState);
    },
    [allowed, enabled, requestPermission, updateState],
  );

  useEffect(() => {
    setScheduleId(getScheduleId(userStorage));
  }, [userStorage]);

  useEffect(() => {
    PushNotification.createChannel({
      channelId: CHANNEL_ID,
      channelName: 'GoodDollar claim notifications',
    });
  }, []);
  return [enabled, toggleEnabled];
};

export const useNotifications = (onOpened = noop, onReceived = noop) => {
  const [enabled] = useNotificationsOptions();
  const mountedRef = useRef(false);

  const receivedHandler = useCallback(
    (notification, completion) => {
      onReceived(notification, getCategory(notification));

      // should call completion otherwise notifications won't receive in background
      completion({alert: true, sound: true, badge: false});
    },
    [onReceived],
  );

  const openedHandler = useCallback(
    (notification, completion = noop) => {
      onOpened(notification, getCategory(notification));
      completion();
    },
    [onOpened],
  );

  useEffect(() => {
    if (!enabled || mountedRef.current) {
      return;
    }

    mountedRef.current = true;
    Notifications.registerRemoteNotifications();

    getInitialNotification()
      .catch(noop)
      .then(notification => {
        if (!notification) {
          return;
        }

        openedHandler(notification);
      });
  }, [enabled, openedHandler]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const events = Notifications.events();

    const subscriptions = [
      events.registerNotificationReceivedForeground(receivedHandler),
      events.registerNotificationReceivedBackground(receivedHandler),
      events.registerNotificationOpened(openedHandler),
    ];

    return () => {
      subscriptions.forEach(subscription => subscription.remove());
    };
  }, [enabled, receivedHandler, openedHandler]);
};
