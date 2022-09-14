import {MessagingAPI} from './apis';
import {noop} from './utils';
import {
  getCategory,
  useNotificationsStateSwitch,
  useStoreProperty,
} from './useNotifications.common';
import {useCallback, useEffect} from 'react';

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

  useEffect(() => {
    if (!enabled) {
      return;
    }

    return MessagingAPI.onMessage(handleReceived);
  }, [enabled, handleReceived]);
};
