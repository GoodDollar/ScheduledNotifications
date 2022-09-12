import {initializeApp} from 'firebase/app';
import {getMessaging, getToken, onMessage} from 'firebase/messaging';

import Config from './config';
import {Permissions, PermissionStatuses} from './types';

const {Granted, Undetermined, Denied, Disabled} = PermissionStatuses;
const notificationsApi =
  typeof Notification === 'undefined' ? {} : Notification;
const toStatusEnum = status =>
  [Granted, Denied].includes(status) ? status : Undetermined;

export const PermissionsAPI = new (class {
  // permissions enum to platform permissions map
  platformPermissions = {};

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

    // if permission is disabled - returning disabled status
    // this needs to temporarly ignore notifications permissions requests on web
    if (permission in disabledPermissions) {
      return Disabled;
    }

    // check notifications permissions
    if (Permissions.Notifications === permission) {
      return toStatusEnum(notificationsApi.permission);
    }

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!platformPermission) {
      return Granted;
    }

    return Undetermined;
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

    // request notifications permissions
    if (Permissions.Notifications === permission) {
      return this._requestNotificationsPermission();
    }

    // no platform permission found - that means feature doesn't requires permissions on this platform
    if (!(permission in disabledPermissions) && !platformPermission) {
      return true;
    }

    return false;
  }

  /** @private */
  async _requestNotificationsPermission() {
    try {
      if (typeof notificationsApi.requestPermission === 'function') {
        const permission = await notificationsApi.requestPermission();

        return toStatusEnum(permission) === PermissionStatuses.Granted;
      }

      return await MessagingAPI.getToken().then(Boolean);
    } catch {
      return false;
    }
  }
})();

export const getInitialNotification = async () => undefined;

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
    } = config;

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
    let {_lastToken, messaging, tokenOpts} = this;

    if (!_lastToken) {
      _lastToken = await getToken(messaging, tokenOpts);
      Object.assign(this, {_lastToken});
    }

    return _lastToken;
  }

  onMessage(callback) {
    return onMessage(this.messaging, callback);
  }
})(Config);
