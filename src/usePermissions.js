import {useCallback, useEffect, useRef, useState} from 'react';

import {PermissionStatuses} from './types';
import {PermissionsAPI as api} from './apis';
import {noop} from './utils';

const {Undetermined, Granted, Denied, Prompt, Disabled} = PermissionStatuses;

const usePermissions = (permission, options = {}) => {
  const {
    onAllowed = noop,
    onPrompt = noop,
    onDenied = noop,
    requestOnMounted = true,
  } = options;

  const mountedState = useRef(false);
  const [allowed, setAllowed] = useState(false);

  const handleAllowed = useCallback(() => {
    onAllowed();

    if (mountedState.current) {
      setAllowed(true);
    }
  }, [onAllowed, setAllowed]);

  const handleRequest = useCallback(async () => {
    const isAllowed = await api.request(permission);

    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happens during processing transaction
    if (!mountedState.current) {
      return;
    }

    if (!isAllowed) {
      onDenied();
      return;
    }

    handleAllowed();
  }, [permission, handleAllowed, onDenied]);

  const handleRequestFlow = useCallback(async () => {
    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happens during processing transaction
    if (!mountedState.current) {
      return;
    }

    const status = await api.check(permission);

    // re-checking mounted state after each delayed / async operation as send link
    // screen could call redirect back if error happens during processing transaction
    if (!mountedState.current) {
      return;
    }

    switch (status) {
      case Granted:
        handleAllowed();
        break;
      case Denied:
        onDenied();
        break;
      case Disabled:
        // TODO: maybe we would need to handle disabled case separately
        // and run correspinding callback prop. for now it will just
        // call onDenied but without showing denied dialog
        onDenied();
        break;
      case Prompt:
      case Undetermined:
      default:
        onPrompt();
        handleRequest();
        break;
    }
  }, [permission, onPrompt, onDenied, handleAllowed, handleRequest]);

  const requestPermission = useCallback(() => {
    if (!requestOnMounted) {
      handleRequestFlow();
    }
  }, [handleRequestFlow, requestOnMounted]);

  useEffect(() => {
    if (!mountedState.current && requestOnMounted) {
      handleRequestFlow();
    }
  }, [requestOnMounted, handleRequestFlow]);

  useEffect(() => {
    mountedState.current = true;
  }, []);

  return [allowed, requestPermission];
};

export default usePermissions;
