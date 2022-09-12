import { RefObject, useEffect, useState } from "react";
import { IonButton, IonButtons, IonContent, IonDatetime, IonHeader, IonItem, IonLabel, IonModal, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar, isPlatform } from "@ionic/react";
import { fetchData } from "../util/storage";
import { notificationKey } from "../util/notifications";

export const SettingsModal = ({
  modal,
  willDismiss = () => {},
} : {
  modal: RefObject<any>,
  willDismiss: (param?: any) => void,
}) => {
  const [notificationSettings, setNotificationSettings] = useState<any>();

  useEffect(() => {
    const load = async () => {
      const data = await fetchData({ key: notificationKey });
      setNotificationSettings(data);
    }
    load();
  }, []);

  const notificationEnabled = notificationSettings?.enabled === 'undefined' || notificationSettings?.enabled;

  return (
    <IonModal ref={modal} trigger="open-modal" onWillDismiss={willDismiss}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => modal.current?.dismiss()}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>Settings</IonTitle>
          <IonButtons slot="end">
            <IonButton strong={true} onClick={() => modal.current?.dismiss()}>
              Done
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel>Set Color</IonLabel>
          <IonSelect slot="end" interface="popover" placeholder="Color">
            <IonSelectOption value="apples">Apples</IonSelectOption>
            <IonSelectOption value="oranges">Oranges</IonSelectOption>
            <IonSelectOption value="bananas">Bananas</IonSelectOption>
          </IonSelect>
        </IonItem>
        {isPlatform('ios') && <IonItem>
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
        {notificationEnabled && isPlatform('ios') && <IonItem>
          <IonLabel>
            <h2>Select Notification time</h2>
            <IonDatetime slot="end" presentation="time"></IonDatetime>
          </IonLabel>
        </IonItem>}
      </IonContent>
    </IonModal>
  );
};
