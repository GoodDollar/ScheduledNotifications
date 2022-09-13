import {initializeApp} from 'firebase/app';
import {getMessaging, getToken, onMessage, isSupported, deleteToken} from 'firebase/messaging';

import Config from './config';
import {Permissions, PermissionStatuses} from './types';

const {Granted, Undetermined, Denied, Disabled} = PermissionStatuses;
const toStatusEnum = status => [Granted, Denied].includes(status) ? status : Undetermined;

export const NotificationsAPI = new (class {
  async isSupported() {
    return isSupported()
  }

  async getInitialNotification() {
    // TODO: ?
    return null
  }
})()

export const PermissionsAPI = new (class {
  // permissions enum to platform permissions map
  platformPermissions = {
    [Permissions.Notifications]: 'notifications'
  };

  disabledPermissions = {};

  /*
   * Retrieves status of permission
   *
   * @param {Permission} Permission needs to be checked
   * @return Promise<PermissionStatus> Status of the permission
   */
  async check(permission) {
    const {platformPermissions, disabledPermissions} = this;
    const platformPermission = platformPermissions[permission];

    // if permission or not supported is disabled - returning disabled status
    if (permission in disabledPermissions) {
      return Disabled;
    }

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return Granted;
    }

    const status = await this._queryPermissions(platformPermission)

    // check notifications permissions if no permissions API
    if (status === false) {
      switch(permission) {
        case Permissions.Notifications:
          return this._checkNotificationsPermission()
        default:
          break;
      }
    }

    // could be changed/extended so we need this switch to map them to platform-independed statuses
    switch (status) {
      case 'granted':
        return Granted
      case 'prompt':
        return Prompt
      case 'denied':
        return Denied
      default:
        return Undetermined
    }
  }

  /*
   * Requests for permission
   *
   * @param {Permission} Permission we're requesting
   * @return Promise<boolean> Was permission granted or nor
   */
  async request(permission) {
    const {platformPermissions, disabledPermissions} = this;
    const platformPermission = platformPermissions[permission];

    if (permission in disabledPermissions) {
      return false
    }

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return true
    }

    try {
      // requesting permissions by direct calling corresponding APIs
      // as permissions API doesn't supports yet requesting for permissions
      switch (permission) {
        case Permissions.Notifications:
          await this._requestNotificationsPermission()
          break
        default:
          break
      }

      return true
    } catch {
      return false
    }
  }

  /** @private */
  async _checkNotificationsPermission() {
    try {
      const notificationsSupported = await isSupported()

      if (!notificationsSupported) {
        throw new Error('Your browser doesn\'t supports push notifications')
      }

      return toStatusEnum(Notification.permission);
    } catch {
      return Disabled
    }
  }

  /** @private */
  async _requestNotificationsPermission() {
    const permission = await Notification.requestPermission();

    if (toStatusEnum(permission) !== PermissionStatuses.Granted) {
      throw new Error('Notification permission denied by user')
    }
  }

  /** @private */
  async _queryPermissions(name) {
    try {
      // requesting permissions
      const { state, status } = await navigator.permissions.query({ name })

      // if succeeded - setting value to return from the response
      return status || state
    } catch {
      return false
    }
  }
})();

export const MessagingAPI = new (class {
  constructor(config) {
    const {
      firebaseApiKey,
      firebaseAuthDomain,
      firebaseProjectId,
      firebaseStorageBucket,
      firebaseMessagingSenderId,
      firebaseAppId,
      firebaseWebPushKeypair,
    } = Config;

    const app = initializeApp({
      apiKey: firebaseApiKey,
      authDomain: firebaseAuthDomain,
      projectId: firebaseProjectId,
      storageBucket: firebaseStorageBucket,
      messagingSenderId: firebaseMessagingSenderId,
      appId: firebaseAppId,
    });

    const tokenOpts = {vapidKey: firebaseWebPushKeypair};
    const messaging = getMessaging(app);

    Object.assign(this, {app, messaging, tokenOpts});
  }

  async getToken() {
    const {messaging, tokenOpts} = this;

    return getToken(messaging, tokenOpts);
  }

  async deleteToken() {
    const {messaging} = this;

    return deleteToken(messaging);
  }

  onMessage(callback) {
    return onMessage(this.messaging, callback);
  }
})();
