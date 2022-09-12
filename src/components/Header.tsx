import {
  IonButton,
  IonIcon,
  isPlatform,
} from '@ionic/react';
import styled from 'styled-components';
import { settings, colorPalette } from 'ionicons/icons';
import Color from 'color';
import pluralize from 'pluralize';
import { StopWatch } from './StopWatch';
import { Duration } from '../pages/KickCounter';

interface HeaderInput {
  top: string;
  newColorIndex: () => void;
  kickCount: number;
  duration: Duration;
  setDuration: (duration: Duration) => void;
  started: boolean;
  toggleStarted: () => void;
  setState: (data: any) => void;
};

export const Header = ({
  top,
  newColorIndex,
  kickCount,
  duration,
  setDuration,
  started,
  toggleStarted,
  setState,
}: HeaderInput) => {
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
    // display: 'none',
    right: 0,
  };
  const colorButton = {
    ...shared,
    left: 0,
  };

  return (
    <HeaderContent color={top}>
      <div style={{ margin: '0 auto', maxWidth: '1045px', top: 0, right: 0, left: 0, position: 'absolute' }}>
        <IonButton style={colorButton} onClick={newColorIndex}>
          <IonIcon slot="icon-only" icon={colorPalette} />
        </IonButton>
        <IonButton id="open-modal" style={settingButton}>
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
  )
};

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