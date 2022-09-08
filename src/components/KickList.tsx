import {
  IonList,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { format as dfFormat, formatDuration, intervalToDuration } from 'date-fns';

interface ListProps {
  hasItems: boolean;
  bottom: string;
  top: string;
  list: any[];
  setState: (data: any) => void;
};

export const KickList = ({
  hasItems,
  bottom,
  top,
  list,
  setState,
}: ListProps) => {
  const itemStyle = { '--background': bottom, '--border-color': top, '--color': 'white' };
  if (!hasItems) return null;
  return (
    <IonList style={{ backgroundColor: bottom, maxWidth: '1000px', margin: '0 auto', minHeight: '50%' }}>
      {
        list.map(({ duration, kicks }: any, index: number) => {
          const formattedDuration = formatDuration(intervalToDuration(duration));
          return (
            <IonItemSliding key={duration?.start}>
              <IonItem style={itemStyle}>
                <IonLabel>
                  <h2>{!formattedDuration || formattedDuration.trim() === '' ? '0 seconds' : formattedDuration}</h2>
                  <p>{dfFormat(new Date(duration?.start || 0), 'MM/dd/yyyy - hh:mm:ss aa')}</p>
                </IonLabel>
                <IonLabel slot="end">Kicks: {kicks}</IonLabel>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption color="danger" expandable onClick={() => {
                  setState({
                    type: 'REMOVE_FROM_KICK_LIST',
                    data: index,
                  });
                }}>Delete</IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          );
        })
      }
    </IonList>
  )
};
