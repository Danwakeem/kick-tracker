/* eslint react-hooks/exhaustive-deps: 0 */
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
  IonIcon,
  isPlatform,
} from '@ionic/react';
import { format as dfFormat, formatDuration, intervalToDuration } from 'date-fns';
import pluralize from 'pluralize';
import styled from 'styled-components';
import Color from 'color';
import { StopWatch } from '../components/StopWatch';
import { fetchData, save } from '../util/storage';
import { settings, colorPalette } from 'ionicons/icons';

interface ColorInput {
  top: string;
  bottom: string;
}

export const timerLimitKey = 'timer-limit-key';

const KickCounter: React.FC<{ colors: ColorInput, newColorIndex: any }> = ({
  colors,
  newColorIndex
}: {
  colors: ColorInput
  newColorIndex: any,
}) => {
  const [timerLimits, setTimerLimits] = useState<any>({
    kickLimit: 10,
    timerLimit: 3600000, // 1 hour
  });
  const [kickData, setKickData] = useState<any>({
    list: [],
  });
  const [kickCount, setKickCount] = useState(0);
  const [duration, setDuration] = useState({
    start: 0,
    end: 0,
  });
  const [started, setStarted] = useState(false);

  const toggleStarted = async () => {
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
  }

  // End timer at kick limit
  useEffect(() => {
    if (kickCount === timerLimits.kickLimit) toggleStarted();
  }, [kickCount]);

  useEffect(() => {
    const loadData = async () => {
      const timerData = await fetchData({ key: timerLimitKey });
      const data = await fetchData();
      if ('list' in data) {
        setKickData(data);
      }
      if (Object.keys(timerData).length > 0) {
        setTimerLimits(timerData);
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
  const shared = {
    position: 'absolute',
    top: isPlatform('ios') ? '40px' : 0,
    '--background': 'transparent',
    '--box-shadow': 'none',
    '--background-activated': 'transparent',
    '--background-focused': 'transparent',
    '--background-hover': 'transparent',
    zIndex: 2,
  };
  const settingButton = {
    ...shared,
    // TODO: Set up a settings page so we can manage notification time
    // and set up an auto shut off time and a desired kick count
    display: 'none',
    right: 0,
  };
  const colorButton = {
    ...shared,
    left: 0,
  };

  const hasItems = (kickData?.list || []).length > 0;

  return (
    <IonPage>
      <IonContent style={{ '--background': bottom }}>
        <HeaderContent color={top}>
          <div style={{ margin: '0 auto', maxWidth: '1045px', top: 0, right: 0, left: 0, position: 'absolute' }}>
            <IonButton style={colorButton} onClick={newColorIndex}>
              <IonIcon slot="icon-only" icon={colorPalette} />
            </IonButton>
            <IonButton style={settingButton}>
              <IonIcon slot="icon-only" icon={settings} />
            </IonButton>
          </div>
          <h1 style={{ margin: 0 }}>{kickCount} {pluralize('Kicks', kickCount)}</h1>
          <StopWatch started={started} duration={duration} setDuration={setDuration} />
          <HeaderButtons>
            <IonButton
              onClick={toggleStarted}
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
        {!hasItems && <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bottom,
          maxWidth: '1000px',
          margin: '0 auto',
          width: '100%',
          height: 'calc(100% - 400px)',
          textAlign: 'center',
          padding: '10px',
        }}>
          <h3>Click start to begin and your count history will show up here.</h3>
        </div>}
        {hasItems && <IonList style={{ backgroundColor: bottom, maxWidth: '1000px', margin: '0 auto', minHeight: '50%' }}>
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
        </IonList>}
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
