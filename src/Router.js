import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as RouterPackage,
    Switch,
    Route,
    useHistory
} from 'react-router-dom';

import './App.css';
import {
    loadStreamerProfile,
    loadQaplaGames
} from './services/database';
import { handleUserAuthentication } from './services/auth';
import StreamersSignin from './components/StreamersSignin/StreamersSignin';
import StreamerOnBoarding from './components/StreamerOnBoarding/StreamerOnBoarding';
import StreamerProfile from './components/StreamerProfile/StreamerProfile';
import NewStream from './components/NewStream/NewStream';
import EventSent from './components/EventSent/EventSent';
import EditStreamerEvent from './components/EditStreamerEvent/EditStreamerEvent';
import LiveDonations from './components/LiveDonations/LiveDonations';
import Settings from './components/Settings/Settings';
import PlanPicker from './components/PlanPicker/PlanPicker';
// import Lottery from './components/Lottery/Lottery';
import StreamsPackages from './components/StreamsPackages/StreamsPackages';
import StreamerProfileEditor from './components/StreamerProfileEditor/StreamerProfileEditor';
import ChargeConfirmationPage from './components/ChargeConfirmationPage/ChargeConfirmationPage';
import { useTranslation } from 'react-i18next'
import OnBoarding from './components/OnBoarding/OnBoarding';
import GiphyTextGenerator from './components/GiphyTextGenerator/GiphyTextGenerator';

window.onbeforeunload = function () {
    return true;
};

// Remove navigation prompt
window.onbeforeunload = null;

const Routes = ({ user, games }) => {
    const history = useHistory();
    const { t } = useTranslation();

    useEffect(() => {
        if (history) {
            history.listen((location) => {
                window.analytics.page();
            });
        }
    }, [history]);

    return (
        <Switch>
            <Route exact path='/'>
                <StreamersSignin user={user} title={t('StreamersSignin.welcome')} />
            </Route>
            <Route exact path='/signin'>
                <StreamersSignin user={user} title={t('StreamersSignin.welcome')} />
            </Route>
            <Route exact path='/welcome'>
                <StreamerOnBoarding user={user} />
            </Route>
            <Route exact path='/create'>
                <NewStream user={user} games={games} />
            </Route>
            <Route exact path='/edit/:streamId'>
                <EditStreamerEvent user={user} games={games} />
            </Route>
            <Route exact path='/profile'>
                <StreamerProfile user={user} games={games} />
            </Route>
            <Route exact path='/success'>
                <EventSent user={user} />
            </Route>
            <Route exact path='/liveDonations/:streamerId'>
                <LiveDonations user={user} />
            </Route>
            <Route exact path='/settings'>
                <Settings user={user} />
            </Route>
            <Route exact path='/membership'>
                <PlanPicker user={user} />
            </Route>
            <Route exact path='/buyStreams'>
                <StreamsPackages user={user} games={games} />
            </Route>
            <Route exact path='/editProfile'>
                <StreamerProfileEditor user={user} />
            </Route>
            <Route exact path='/successCheckout'>
                <ChargeConfirmationPage user={user} />
            </Route>
            <Route exact path='/onboarding'>
                <OnBoarding user={user} />
            </Route>
            <Route exact path='/giphyTextGenerator/:uid/:text'>
                <GiphyTextGenerator user={user} />
            </Route>
            {/* <Route exact path='/lottery'>
                <Lottery user={user} />
            </Route> */}
        </Switch>
    );
}

const Router = () => {
    const [games, setGames] = useState({});
    const [user, setUser] = useState(null);

    useEffect(() => {

        /**
         * Load and save all the games on the state
         */
        async function loadGamesResources() {
            setGames(await loadQaplaGames());
        }

        function checkIfUserIsAuthenticated() {
            handleUserAuthentication((user) => {
                loadStreamerProfile(user.uid, (userData) => {
                    setUser({ ...userData, admin: false, streamer: true, uid: user.uid });
                });
            }, () => {
                setUser(undefined);
            });
        }

        if (!user) {
            loadGamesResources();
            checkIfUserIsAuthenticated();
        }
    }, [user]);

    return (
        <RouterPackage>
            <Routes user={user} games={games} />
        </RouterPackage>
    );
}

export default Router;
