import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {noop} from './utils';

const UserStorageContext = createContext({
  userStorage: null,
});

class UserProperties {
  local = {};

  constructor() {
    this.ready = AsyncStorage.getItem('@localProps')
      .then(JSON.parse)
      .then(props => (this.local = props || {}))
      .then(() => this);
  }

  getLocal(prop) {
    return this.local[prop];
  }

  async setLocal(prop, value) {
    this.local[prop] = value;
    await AsyncStorage.setItem('@localProps', JSON.stringify(this.local));
  }

  safeSet(prop, value) {
    this.setLocal(prop, value).catch(noop);
  }
}

class UserStorage {
  constructor() {
    this.userProperties = new UserProperties();
    this.ready = this.userProperties.ready.then(() => this);
  }
}

export const UserStorageProvider = ({children}) => {
  const [userStorage, setUserStorage] = useState();

  useEffect(() => {
    const storage = new UserStorage();

    storage.ready.then(setUserStorage);
  }, [setUserStorage]);

  return (
    <UserStorageContext.Provider value={{userStorage}}>
      {children}
    </UserStorageContext.Provider>
  );
};

export const useUserStorage = () => {
  const {userStorage} = useContext(UserStorageContext);

  return userStorage;
};
