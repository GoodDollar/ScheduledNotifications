import {MessagingAPI} from './apis';
import {noop} from './utils';
import {
  useNotificationsStateSwitch,
  useStoreProperty,
} from './useNotifications.common';
import {useCallback, useEffect} from 'react';

export {useNotificationsSupport} from './useNotifications'

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

  const handleOpened = useCallback(payload => {
    console.log(payload);
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onMessage = ({data}) => {
      const {message, payload} = data;

      if (message === 'notification') {
        handleOpened(payload);
      }
    };

    const {serviceWorker} = window;
    const unsubscribe = MessagingAPI.onMessage(handleOpened);

    serviceWorker.addEventListener('message', onMessage);

    return () => {
      serviceWorker.removeEventListener('message', onMessage);
      unsubscribe();
    };
  }, [enabled, handleOpened]);
};
