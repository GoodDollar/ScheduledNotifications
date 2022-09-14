import {useCallback, useEffect, useRef} from 'react';
import {MessagingAPI} from './apis';
import {noop} from './utils';
import {BROADCAST_CHANNEL} from './constants';
import {
  getCategory,
  useNotificationsStateSwitch,
  useStoreProperty,
} from './useNotifications.common';
import {NotificationsAPI} from './apis.web';

const getNotification = payload => {
  const {data, notification} = payload;

  return {
    ...notification,
    payload: data,
  };
};

export {useNotificationsSupport} from './useNotifications.common';

export const useNotificationsOptions = () => {
  const [token, setToken] = useStoreProperty('notificationsToken');

  const updateState = useCallback(
    async value => {
      let newToken = null;

      if (value === true) {
        newToken = await MessagingAPI.getToken();
      } else {
        await MessagingAPI.deleteToken();
      }

      setToken(newToken);
    },
    [setToken],
  );

  const switchState = useNotificationsStateSwitch(token, updateState);

  return switchState;
};

export const useNotifications = (onOpened = noop, onReceived = noop) => {
  const [enabled] = useNotificationsOptions();
  const mountedRef = useRef(false);

  const handleReceived = useCallback(
    payload => {
      const notification = getNotification(payload);
      const category = getCategory(notification);
      const {title, body, image} = notification;

      onReceived(notification, category);

      const localNotification = new Notification(title, {
        body,
        icon: image,
      });

      localNotification.addEventListener('click', event => {
        event.preventDefault();
        onOpened(notification, category);
      });
    },
    [onReceived, onOpened],
  );

  const handleFromBackground = useCallback(
    nativeEvent => {
      const {event, data} = nativeEvent.data;

      if (!['received', 'opened'].includes(event)) {
        return;
      }

      const notification = getNotification(data);
      const category = getCategory(notification);
      const handlerFn = event === 'received' ? onReceived : onOpened;

      handlerFn(notification, category);
    },
    [onOpened, onReceived],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const channel = new BroadcastChannel(BROADCAST_CHANNEL);
    const unsubscribe = MessagingAPI.onMessage(handleReceived);

    channel.addEventListener('message', handleFromBackground);

    return () => {
      unsubscribe();

      channel.removeEventListener('message', handleFromBackground);
      channel.close();
    };
  }, [enabled, handleReceived, handleFromBackground]);

  useEffect(() => {
    if (!enabled || mountedRef.current) {
      return;
    }

    mountedRef.current = true;
    NotificationsAPI.getInitialNotification();
  }, [enabled]);
};
