import { RefObject, useEffect, useState } from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
  IonInput
} from "@ionic/react";
import { useDebounce } from 'react-use';
import { fetchData, save, TIMER_LIMIT_KEY, NOTIFICATION_KEY, COLOR_KEY } from "../util/storage";
import { colorList } from "../util/colorList";
import { format, getHours, getMinutes, setHours, setMinutes } from "date-fns";
import { cancelNotifications, scheduleNotification } from "../util/notifications";

const defaultNotificationSettings = {
  enabled: true,
  hour: 18, // 6pm
  minute: 0,
  title: 'Log some kicks!',
  body: 'It is good to measure your kicks every day',
};

const defaultTimerLimits = {
  kickLimit: 10,
  timerLimit: 3600000,
};

const defaultSelectedColor = { color: -1 };

export const SettingsModal = ({
  modal,
  newColorIndex,
  willDismiss = () => {},
} : {
  modal: RefObject<any>,
  newColorIndex: (num: number) => void,
  willDismiss: (param?: any) => void,
}) => {
  const browser = document.URL.startsWith('http');
  const [initialized, setInitialized] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<{
    color: number
  }>(defaultSelectedColor);
  const [notificationSettings, setNotificationSettings] = useState<{
    enabled: boolean;
    hour: number;
    minute: number;
    title: string;
    body: string;
  }>(defaultNotificationSettings);
  const [timerLimits, setTimerLimits] = useState<{
    kickLimit: number;
    timerLimit: number;
  }>(defaultTimerLimits);

  const date = setMinutes(setHours(new Date(), notificationSettings.hour), notificationSettings.minute);
  const notificationTime = `${format(date, 'yyyy-MM-dd')}T${format(date, 'HH:mm:ss')}`;

  // Initialize data from storage
  useEffect(() => {
    const load = async () => {
      const tLimits = await fetchData({ key: TIMER_LIMIT_KEY });
      const data = await fetchData({ key: NOTIFICATION_KEY });
      const colorKey = await fetchData({ key: COLOR_KEY });
      setNotificationSettings(Object.keys(data).length > 0 ? data : defaultNotificationSettings);
      setTimerLimits(Object.keys(tLimits).length > 0 ? tLimits : defaultTimerLimits);
      setSelectedColor(Object.keys(colorKey).length > 0 ? colorKey : defaultSelectedColor);
      setInitialized(true);
    }
    load();
  }, []);

  // Save notification settings to storage
  useEffect(() => {
    (async () => {
      if (initialized) {
        await save({
          value: notificationSettings,
          key: NOTIFICATION_KEY,
        });
      }
    })();
  }, [notificationSettings, initialized]);

  // Save color selection
  useEffect(() => {
    (async () => {
      if (initialized) {
        await save({
          value: selectedColor,
          key: COLOR_KEY,
        });
        if (selectedColor.color !== -1) {
          newColorIndex(selectedColor.color);
        }
      }
    })();
  }, [selectedColor, initialized, newColorIndex]);

  // Save timer limits to storage
  useDebounce(
    () => {
      (async () => {
        if (initialized) {
          await save({
            value: timerLimits,
            key: TIMER_LIMIT_KEY,
          });
        }
      })();
    },
    500,
    [timerLimits, initialized]
  );

  // Save notification settings to storage
  useDebounce(
    () => {
      (async () => {
        if (initialized) {
          await save({
            value: notificationSettings,
            key: NOTIFICATION_KEY,
          });
          if (notificationSettings.enabled) {
            await scheduleNotification(notificationSettings);
          } else {
            await cancelNotifications();
          }
        }
      })();
    },
    500,
    [notificationSettings, initialized]
  );

  // Close modal and send data back to counter page
  const dismiss = () => {
    willDismiss({
      timerLimits
    });
  }

  const notificationEnabled = notificationSettings.enabled;

  return (
    <IonModal ref={modal} trigger="open-modal" onWillDismiss={dismiss}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
          <IonButtons slot="end">
            {/* There is a glitch if the keyboard is open and we close immediately */}
            <IonButton strong={true} onClick={() => setTimeout(() => modal.current?.dismiss(), 50)}>
              Done
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel>Set Color</IonLabel>
          <IonSelect
            value={selectedColor.color}
            onIonChange={(event) => setSelectedColor({
              color: typeof event.target.value === 'number' ? event.target.value : -1
            })}
            slot="end"
            interface="popover"
            placeholder="Color"
          >
            <IonSelectOption value={-1}>random</IonSelectOption>
            {colorList.map((color, index) => (
              <IonSelectOption key={color.name} value={index}>{color.name}</IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Max Kicks</IonLabel>
          <IonInput type="tel" onIonChange={(event) => {
            setTimerLimits({
              ...timerLimits,
              kickLimit: typeof event.target.value === 'number' ? event.target.value : parseInt(event.target.value || '0', 10),
            });
          }} value={timerLimits?.kickLimit === 0 ? '' : timerLimits.kickLimit}></IonInput>
        </IonItem>
        {!browser && <IonItem>
          <IonLabel>Enable notification</IonLabel>
          <IonToggle
            slot="end"
            checked={notificationEnabled}
            onIonChange={(event) => {
              setNotificationSettings({
                ...notificationSettings,
                enabled: event.detail.checked,
              })
            }}
          />
        </IonItem>}
        {notificationEnabled && !browser && <IonItem>
          <IonLabel>
            <h2>Select Notification time</h2>
            <IonDatetime value={notificationTime} onIonChange={(event) => {
              if (event.target.value && !Array.isArray(event.target.value)) {
                const date = new Date(event.target.value);
                const updates = {
                  hour: getHours(date),
                  minute: getMinutes(date),
                };
                if (updates.hour !== notificationSettings.hour || updates.minute !== notificationSettings.minute) {
                  setNotificationSettings({
                    ...notificationSettings,
                    ...updates,
                  });
                }
              }
            }} slot="end" presentation="time"></IonDatetime>
          </IonLabel>
        </IonItem>}
      </IonContent>
    </IonModal>
  );
};
