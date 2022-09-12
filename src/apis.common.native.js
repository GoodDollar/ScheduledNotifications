// @flow

import {Platform} from 'react-native';

import PushNotification from 'react-native-push-notification';

import {Permissions, PermissionStatuses} from './types';
import {noop} from './utils';

const {Granted, Denied, Prompt, Undetermined} = PermissionStatuses;

export const PermissionsAPI = new (class {
  // permissions enum to platform permissions map
  platformPermissions = {};

  notificationOptions = Platform.select({
    ios: ['alert', 'badge', 'sound'],
    android: ['alert'],
  });

  constructor() {
    this._toResult = this._toResult.bind(this);
  }

  async check(permission) {
    const {platformPermissions, _toResult} = this;
    const platformPermission = platformPermissions[permission];

    // if no platform permission found - that means feature
    // doesn't requires permissions on this platform
    let result = Granted;

    // to check notifications permissions we should use separate method
    if (Permissions.Notifications === permission) {
      result = await new Promise(resolve =>
        PushNotification.checkPermissions(status => resolve(_toResult(status))),
      );
    } else if (platformPermission) {
      // if platform permissions was set - calling api
      result = Undetermined;
    }

    return result;
  }

  async request(permission) {
    const {platformPermissions, notificationOptions, _toResult} = this;
    const platformPermission = platformPermissions[permission];

    // there's only check notifications method available
    // on IOS it have extended 'request' version we could specify settings desired.
    // so in case of request notifications we just re-call check
    if (Permissions.Notifications === permission) {
      const requestResult = await PushNotification.requestPermissions(
        notificationOptions,
      );

      return _toResult(requestResult) === Granted;
    }

    // if no platform permission found - that means feature
    // doesn't requires permissions on this platform
    if (!platformPermission) {
      return true;
    }

    return false;
  }

  /** @private */
  _toResult(status) {
    const statusValues = this.notificationOptions.map(option => status[option]);

    if (statusValues.every(value => !!value)) {
      return Granted;
    }

    return Platform.OS === 'android' || status.authorizationStatus === 1
      ? Denied
      : Prompt;
  }
})();

export const MessagingAPI = {getToken: noop, onMessage: noop};
