import { LocalNotifications } from '@capacitor/local-notifications';
import { isPlatform } from '@ionic/react';
import { fetchData, save } from './storage';

const localKey = 'kick-notification-permissions';
const localNotificationKey = 1;

export const grantPermissions = async () => {
  try {
    if (isPlatform('ios')) {
      try {
        const { display } = await LocalNotifications.requestPermissions();
        console.log('display', display);
        const notificationSettings = await fetchData({key: localKey});
        if (display === 'granted') await scheduleNotification(notificationSettings);
      } catch (error) {
        console.error('Error: ', error);
      }
    }
  } catch(error) {
    console.error('Error: ', error);
  }
};

export const scheduleNotification = async ({
  title = 'Log some kicks!',
  body = 'It is good to measure your kicks every day',
  hour = 18, // 6pm
  minute = 0, // 0 minutes into the hour
} = {}) => {
  try {
    if (isPlatform('ios')) {
      const { display } = await LocalNotifications.checkPermissions();
      if (display === 'granted') {
        await LocalNotifications.cancel({
          notifications: [{ id: localNotificationKey }],
        });
        await LocalNotifications.schedule({
          notifications: [{
            id: localNotificationKey,
            title,
            body,
            schedule: {
              on: {
                hour,
                minute,
                second: 0,
              },
              every: 'day'
            },
          }],
        });
        await save({
          key: localKey,
          value: {
            title,
            body,
            hour,
            minute,
          },
        });
      }
    }
  } catch(error) {
    console.error(error);
  }
}
