import { NativeStorage as storage } from '@awesome-cordova-plugins/native-storage';

const DEFAULT_KEY = 'kick-counter';

export const save = async ({
  key = DEFAULT_KEY,
  value
} : {
  key?: string;
  value: any;
}) => {
  const browser = document.URL.startsWith('http');
  if (browser) {
    window.localStorage.setItem(key, JSON.stringify(value));
  } else {
    await storage.setItem(key, value);
  }
  return value;
};

export const fetchData = async ({
  key = DEFAULT_KEY,
} : {
  key?: string;
} = {}) => {
  const browser = document.URL.startsWith('http');
  if (browser) {
    const data = window.localStorage.getItem(key) || '{}';
    return JSON.parse(data);
  } else {
    return storage.getItem(key);
  }
};