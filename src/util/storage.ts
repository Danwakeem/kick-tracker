import { Storage, Drivers } from '@ionic/storage';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';

export const DEFAULT_KEY = 'kick-counter';
export const COLOR_KEY = 'color-key';
export const TIMER_LIMIT_KEY = 'timer-limits';
export const NOTIFICATION_KEY = 'kick-notification-permissions';
export const store = new Storage({
  driverOrder: [
    CordovaSQLiteDriver._driver,
    Drivers.IndexedDB,
    Drivers.LocalStorage
  ],
});
let isCreated = false;
(async () => {
  try {
    await store.create();
    isCreated = true;
  } catch(error) {
    console.error(error);
  }
})();

export const save = async ({
  key = DEFAULT_KEY,
  value
} : {
  key?: string;
  value: any;
}) => {
  try {
    // Wait for store to be created
    while (!isCreated) {}
    await store.set(key, JSON.stringify(value));
  } catch(error) {
    console.log(error);
    throw error;
  }
  return value;
};

export const fetchData = async ({
  key,
} : {
  key: string;
}) => {
  try {
    while (!isCreated) {}
    const data = await store.get(key);
    return JSON.parse(data || '{}');
  } catch(error) {
    console.log(error);
    throw error;
  }
};