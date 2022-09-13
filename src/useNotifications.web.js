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

  const handleReceived = useCallback(payload => {
    console.log(payload);
    onReceived(payload)

    //TODO: check payload, adjust
    const {title, body, image} = payload.notification

    const notification = new Notification(title, {
      body, icon: image
    })

    notification.addEventListener('click', event => {
      event.preventDefault()
      onOpened(payload)
    })
  }, [onReceived, onOpened]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onMessage = ({data}) => {
      const {message, payload} = data;

      if (message !== 'notification') {
        handleReceived(payload);
      }
    };

    const {serviceWorker} = window;
    const unsubscribe = MessagingAPI.onMessage(handleReceived);

    serviceWorker.addEventListener('message', onMessage);

    return () => {
      serviceWorker.removeEventListener('message', onMessage);
      unsubscribe();
    };
  }, [enabled, handleReceived]);
};
