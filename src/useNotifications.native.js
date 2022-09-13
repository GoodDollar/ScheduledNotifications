import {useCallback, useEffect, useRef} from 'react';
import {Notifications} from 'react-native-notifications';
import PushNotification from 'react-native-push-notification';

import Config from './config';
import {noop} from './utils';
import {getInitialNotification} from './apis';
import {
  useNotificationsStateSwitch,
  useStoreProperty,
} from './useNotifications.common';

const {notificationTime, notificationSchedule} = Config;
const CHANNEL_ID = 'org.gooddollar.notifications.claim';

const NOTIFICATION = {
  title: "It's that time of the day 💸 💙",
  message: 'Claim your free GoodDollars now. It takes 10 seconds.',
};

const getCategory = notification => {
  const {payload} = notification || {};
  const {category} = payload || {};

  return category;
};

export {useNotificationsSupport} from './useNotifications.common'

export const useNotificationsOptions = () => {
  const [scheduleId, setScheduleId] = useStoreProperty(
    'notificationsScheduleId',
  );

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
    },
    [scheduleId, setScheduleId],
  );

  const switchState = useNotificationsStateSwitch(scheduleId, updateState);

  useEffect(() => {
    PushNotification.createChannel({
      channelId: CHANNEL_ID,
      channelName: 'GoodDollar claim notifications',
    });
  }, []);

  return switchState;
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
