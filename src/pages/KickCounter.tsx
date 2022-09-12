import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  IonContent,
  IonPage,
} from '@ionic/react';
import styled from 'styled-components';
import { DEFAULT_KEY, fetchData, save } from '../util/storage';
import { Header } from '../components/Header';
import { EmptyList } from '../components/EmptyList';
import { KickList } from '../components/KickList';
import { SettingsModal } from '../components/SettingsModal';

interface ColorInput {
  top: string;
  bottom: string;
}

export interface State {
  initialized: boolean;
  timerLimits: TimerLimits;
  kickData: KickData;
  kickCount: number;
  duration: Duration;
  started: boolean;
};

export interface TimerLimits {
  kickLimit: number;
  timerLimit: number;
};

export interface KickData {
  list: any[];
};

export interface Duration {
  start: number;
  end: number;
};

const reducer = (state: State, action: any) => {
  switch (action.type) {
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

export const timerLimitKey = 'timer-limits';

const KickCounter: React.FC<{ colors: ColorInput, newColorIndex: any }> = ({
  colors,
  newColorIndex
}: {
  colors: ColorInput
  newColorIndex: any,
}) => {
  const modal = useRef<HTMLIonModalElement>();
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
      try {
        const timerLimits = await fetchData({ key: timerLimitKey });
        const kickData = await fetchData({ key: DEFAULT_KEY });
        setState({
          type: 'INIT_USER_DATA',
          ...(('list' in kickData) ? {kickData} : {}),
          ...((Object.keys(timerLimits).length > 0) ? {timerLimits} : {}),
        });
      } catch (error) {
        console.log('Failure in hook', error);
      }
    }
    loadData();
  }, []);

  const { top, bottom } = colors;

  const hasItems = (list || []).length > 0;

  return (
    <IonPage>
      <IonContent style={{ '--background': bottom }}>
        <Header
          top={top}
          newColorIndex={newColorIndex}
          kickCount={kickCount}
          duration={duration}
          setDuration={setDuration}
          started={started}
          toggleStarted={toggleStarted}
          setState={setState}
        />
        <Buffer />
        <EmptyList initialized={initialized} hasItems={hasItems} bottom={bottom} />
        <KickList
          hasItems={hasItems}
          top={top}
          bottom={bottom}
          list={list}
          setState={setState}
        />
        <SettingsModal modal={modal} willDismiss={() => {}} />
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

export default KickCounter;
