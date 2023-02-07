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
    loadQaplaGames,
    listenToStreamerDrops,
    setStreamerDashboardUserLanguage
} from './services/database';
import { handleUserAuthentication } from './services/auth';
import StreamersSignin from './components/StreamersSignin/StreamersSignin';
import StreamerOnBoarding from './components/StreamerOnBoarding/StreamerOnBoarding';
import StreamerProfile from './components/StreamerProfile/StreamerProfile';
import NewStream from './components/NewStream/NewStream';
import EventSent from './components/EventSent/EventSent';
import EditStreamerEvent from './components/EditStreamerEvent/EditStreamerEvent';
import Overlay from './components/Overlay/Overlay';
import Settings from './components/Settings/Settings';
// import Lottery from './components/Lottery/Lottery';
import StreamsPackages from './components/StreamsPackages/StreamsPackages';
import StreamerProfileEditor from './components/StreamerProfileEditor/StreamerProfileEditor';
import ChargeConfirmationPage from './components/ChargeConfirmationPage/ChargeConfirmationPage';
import { useTranslation } from 'react-i18next'
import OnBoarding from './components/OnBoarding/OnBoarding';
import GiphyTextGenerator from './components/GiphyTextGenerator/GiphyTextGenerator';
import { getCurrentLanguage } from './utilities/i18n';

window.onbeforeunload = function () {
    return true;
};

// Remove navigation prompt
window.onbeforeunload = null;

/**
 * Most of our pages need a background color of #0D1021 but not all, this container ensures
 * to apply the right background color to any page, especially because in some cases (like on
 * Overlay component) we need the background color to be applied inmediately
 */
const PageContainer = ({ backgroundColor = '#0D1021', children }) => (
    <div style={{ backgroundColor, minHeight: '100vh', minWidth: '100vw' }}>
        {children}
    </div>
);

const Routes = ({ user, games, qoinsDrops }) => {
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
                <PageContainer>
                    <StreamersSignin user={user} title={t('StreamersSignin.welcome')} />
                </PageContainer>
            </Route>
            <Route exact path='/signin'>
                <PageContainer>
                    <StreamersSignin user={user} title={t('StreamersSignin.welcome')} />
                </PageContainer>
            </Route>
            <Route exact path='/welcome'>
                <StreamerOnBoarding user={user} />
            </Route>
            <Route exact path='/create'>
                <PageContainer>
                    <NewStream user={user} games={games} qoinsDrops={qoinsDrops} />
                </PageContainer>
            </Route>
            <Route exact path='/edit/:streamId'>
                <PageContainer>
                    <EditStreamerEvent user={user} games={games} />
                </PageContainer>
            </Route>
            <Route exact path='/profile'>
                <PageContainer>
                    <StreamerProfile user={user} games={games} qoinsDrops={qoinsDrops} />
                </PageContainer>
            </Route>
            <Route exact path='/success'>
                <PageContainer>
                    <EventSent user={user} />
                </PageContainer>
            </Route>
            <Route exact path='/liveDonations/:streamerId'>
                <PageContainer backgroundColor='transparent'>
                    <Overlay user={user} />
                </PageContainer>
            </Route>
            <Route exact path='/settings'>
                <PageContainer>
                    <Settings user={user} />
                </PageContainer>
            </Route>
            <Route exact path='/buyStreams'>
                <PageContainer>
                    <StreamsPackages user={user} games={games} />
                </PageContainer>
            </Route>
            <Route exact path='/editProfile'>
                <PageContainer>
                    <StreamerProfileEditor user={user} />
                </PageContainer>
            </Route>
            <Route exact path='/successCheckout'>
                <PageContainer>
                    <ChargeConfirmationPage user={user} />
                </PageContainer>
            </Route>
            <Route exact path='/onboarding'>
                <PageContainer>
                    <OnBoarding user={user} />
                </PageContainer>
            </Route>
            <Route exact path='/giphyTextGenerator/:uid/:text'>
                <PageContainer>
                    <GiphyTextGenerator user={user} />
                </PageContainer>
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
    const [qoinsDrops, setQoinsDrops] = useState({ left: 0, original: 0, used: 0 });

    useEffect(() => {

        /**
         * Load and save all the games on the state
         */
        async function loadGamesResources() {
            setGames(await loadQaplaGames());
        }

        async function getDropQoins(uid) {
            listenToStreamerDrops(uid, (drops) => {
                if (drops.exists()) {
                    setQoinsDrops(drops.val());
                }
            });
        }

        function checkIfUserIsAuthenticated() {
            handleUserAuthentication((user) => {
                loadStreamerProfile(user.uid, (userData) => {
                    setUser({ ...userData, admin: false, streamer: true, uid: user.uid });
                    // We send the language to use it on the reactions overlay
                    setStreamerDashboardUserLanguage(user.uid, getCurrentLanguage());
                    getDropQoins(user.uid);
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
            <Routes user={user} games={games} qoinsDrops={qoinsDrops} />
        </RouterPackage>
    );
}

export default Router;
