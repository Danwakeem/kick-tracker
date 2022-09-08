import { useCallback, useEffect, useMemo, useReducer } from 'react';
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

const reducer = (state: any, action: any) => {
  switch (action.type) {
    case 'SET_TIMER_LIMITS':
      return {
        ...state,
        timerLimits: action.data,
      };
    case 'SET_DURATION': {
      return {
        ...state,
        duration: action.data,
      };
    }
    case 'INIT_USER_DATA': {
      return {
        ...state,
        ...(action.timerLimits ? {timerLimits: action.timerLimits} : {}),
        ...(action.kickData ? {kickData: action.kickData} : {}),
        initialized: true,
      };
    }
    case 'REMOVE_FROM_KICK_LIST': {
      return {
        ...state,
        kickData: {
          ...state.kickData,
          list: state.kickData.list.filter((_: any, i: number) => i !== action.data),
        },
      };
    }
    case 'START': {
      return {
        ...state,
        kickCount: 0,
        started: true,
      };
    }
    case 'ADD_TO_KICK_LIST': {
      return {
        ...state,
        started: false,
        kickData: {
          ...state.kickData,
          list: [
            action.data,
            ...state.kickData.list,
          ],
        },
      };
    }
    case 'INCREMENT_KICK_COUNT':
      const newCount = state.kickCount + 1;
      let started = state.started;
      let kickData = state.kickData;
      if (newCount === state.timerLimits.kickLimit) {
        started = false;
        kickData = {
          ...kickData,
          list: [
            { kicks: newCount, duration: state.duration },
            ...kickData.list,
          ],
        };
      }
      return {
        ...state,
        kickData,
        started,
        kickCount: state.kickCount + 1,
      };
    default:
      throw new Error();
  }
};

export const timerLimitKey = 'timer-limit-key';

const KickCounter: React.FC<{ colors: ColorInput, newColorIndex: any }> = ({
  colors,
  newColorIndex
}: {
  colors: ColorInput
  newColorIndex: any,
}) => {
  const [state, setState] = useReducer(reducer, {
    initialized: false,
    timerLimits: {
      kickLimit: 10,
      timerLimit: 3600000, // 1 hour
    },
    kickData: {
      list: [],
    },
    kickCount: 0,
    duration: {
      start: 0,
      end: 0,
    },
    started: false,
  });

  const {
    kickCount,
    started,
    duration,
    kickData: listData,
    initialized,
  } = state;
  const kickData: any = useMemo(() => listData, [listData]);
  const { list } = kickData;

  const setDuration = useCallback((data: any) => {
    setState({
      type: 'SET_DURATION',
      data,
    })
  }, []);

  const toggleStarted = () => {
    if (started) {
      setState({
        type: 'ADD_TO_KICK_LIST',
        data: { kicks: kickCount, duration },
      });
    } else {
      setState({
        type: 'START',
      });
    }
  }

  // Save when the kick data changes
  // after the first initialization
  useEffect(() => {
    (async () => {
      if (initialized) {
        await save({
          value: kickData,
        });
      }
    })();
  }, [kickData, initialized]);

  useEffect(() => {
    const loadData = async () => {
      const timerLimits = await fetchData({ key: timerLimitKey });
      const kickData = await fetchData();
      setState({
        type: 'INIT_USER_DATA',
        ...(('list' in kickData) ? {kickData} : {}),
        ...((Object.keys(timerLimits).length > 0) ? {timerLimits} : {}),
      });
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

  const hasItems = (list || []).length > 0;

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
                setState({
                  type: 'INCREMENT_KICK_COUNT',
                });
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
            (list || []).map(({ duration, kicks }: any, index: number) => {
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
