import {useCallback, useEffect, useMemo, useState} from 'react';
import {NotificationsAPI} from './apis';
import {Permissions} from './types';
import usePermissions from './usePermissions';
import {useUserStorage} from './useUserStorage';

const getStoreProperty = (userStorage, property) => {
  if (!userStorage) {
    return null;
  }

  return userStorage.userProperties.getLocal(property);
};

export const useStoreProperty = property => {
  const userStorage = useUserStorage();
  const [propertyValue, setPropertyValue] = useState(() =>
    getStoreProperty(userStorage, property),
  );

  const updatePropertyValue = useCallback(
    newValue => {
      setPropertyValue(newValue);
      userStorage.userProperties.safeSet(property, newValue);
    },
    [setPropertyValue, userStorage, property],
  );

  useEffect(() => {
    setPropertyValue(getStoreProperty(userStorage, property));
  }, [property, userStorage, setPropertyValue]);

  return [propertyValue, updatePropertyValue];
};

export const useNotificationsSupport = () => {
  const [supportedState, setSupportedState] = useState('');
  const supported = useMemo(() => supportedState === true, [supportedState]);
  const unsupported = useMemo(() => supportedState === false, [supportedState]);

  useEffect(() => {
    NotificationsAPI.isSupported()
      .catch(() => false)
      .then(setSupportedState);
  }, [setSupportedState]);

  return [supported, unsupported];
};

export const useNotificationsStateSwitch = (storeProp, updateState) => {
  const enabled = useMemo(() => !!storeProp, [storeProp]);
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

  return [enabled, toggleEnabled];
};
