import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import KickCounter from './pages/KickCounter';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import './index.css';

/* Theme variables */
import './theme/variables.css';
import Color from 'color';
import { colorList } from './util/colorLIst';

setupIonicReact();

const App: React.FC = () => {
  const {top, bottom} = colorList[Math.floor(Math.random()*colorList.length)];
  const bgColor = Color(top).lighten(0.3);
  const themeWrapper = document.querySelector('body');
  if (themeWrapper) {
    themeWrapper?.style?.setProperty('background-color', bgColor.hex());
  }
  return (
    <IonApp style={{
      maxWidth: '1000px',
      backgroundColor: top,
      margin: '0 auto',
      filter: 'brighten(20%)'
    }}>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/counter">
            <KickCounter colors={{ top, bottom }} />
          </Route>
          <Route exact path="/">
            <Redirect to="/counter" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
