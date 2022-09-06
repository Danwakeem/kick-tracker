import { useEffect, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import { format as dfFormat, formatDuration, intervalToDuration } from 'date-fns';
import pluralize from 'pluralize';
import styled from 'styled-components';
import Color from 'color';
import { StopWatch } from '../components/StopWatch';
import { fetchData, save } from '../util/storage';

interface ColorInput {
  top: string;
  bottom: string;
}

const KickCounter: React.FC<{ colors: ColorInput }> = ({
  colors
}: {
  colors: ColorInput
}) => {
  const [kickData, setKickData] = useState<any>({
    list: [],
  });
  const [kickCount, setKickCount] = useState(0);
  const [duration, setDuration] = useState({
    start: 0,
    end: 0,
  });
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchData({});
      if ('list' in data) {
        setKickData(data);
      }
    }
    loadData();
  }, []);

  const { top, bottom } = colors;

  const itemStyle = { '--background': bottom, '--border-color': top, '--color': 'white' };
  const headerButton = {
    '--background': 'white',
    '--color': 'black',
    '--box-shadow': 'none',
    '--ripple-color': Color(top).darken(0.3).hex().toString(),
    '--background-hover': Color(top).darken(0.3).hex().toString(),
    '--background-focused': Color(top).darken(0.3).hex().toString(),
    '--background-activated': Color(top).darken(0.3).hex().toString(),
    '--background-activated-opacity': 0.3,
    '--background-focused-opacity': 0.3,
    '--background-hover-opacity': 0.3,
  };

  return (
    <IonPage>
      <IonContent style={{ '--background': bottom }}>
        <HeaderContent color={top}>
          <h1 style={{ margin: 0 }}>{kickCount} {pluralize('Kicks', kickCount)}</h1>
          <StopWatch started={started} duration={duration} setDuration={setDuration} />
          <HeaderButtons>
            <IonButton
              onClick={async () => {
                if (started) {
                  const newKickData = {
                    ...kickData,
                    list: [
                      { kicks: kickCount, duration },
                      ...kickData.list,
                    ],
                  };
                  await save({
                    value: newKickData,
                  });
                  setKickData(newKickData);
                } else {
                  setKickCount(0);
                }
                setStarted(!started);
              }}
              shape="round"
              style={headerButton}
            >
              {started ? 'Stop' : 'Start'}
            </IonButton>
            <IonButton
              shape="round"
              disabled={!started}
              onClick={() => {
                if (started) {
                  setKickCount(kickCount + 1);
                }
              }}
              style={headerButton}
            >
              Kick!
            </IonButton>
          </HeaderButtons>
        </HeaderContent>
        <Buffer />
        <IonList style={{ backgroundColor: bottom }}>
          {
            (kickData?.list || []).map(({ duration, kicks }: any, index: number) => {
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
                    <IonItemOption color="danger" expandable onClick={async () => {
                      const finalData = {
                        ...kickData,
                        list: kickData.list.filter((_: any, i: number) => index !== i),
                      };
                      setKickData(finalData);
                      await save({ value: finalData });
                    }}>Delete</IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              );
            })
          }
        </IonList>
      </IonContent>
    </IonPage>
  );
};

const Buffer = styled.div`
  height: 400px;
  width: 100%;
  background-color: transparent;
  z-index: -1;
`;

const HeaderButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  height: 400px;
  position: fixed;
  overflow: hidden;
  background-color: ${props => props.color};
  color: white;
  font-weight: bold;
  top: 0;
  left: 0;
  right: 0;
`;

export default KickCounter;
