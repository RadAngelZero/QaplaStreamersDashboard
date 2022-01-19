import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as RouterPackage,
    Switch,
    Route
} from 'react-router-dom';

import './App.css';
import {
    loadStreamerProfile,
    loadQaplaGames
} from './services/database';
import { handleUserAuthentication, signOut } from './services/auth';
import InviteCode from './components/InviteCode/InviteCode';
import StreamersSignin from './components/StreamersSignin/StreamersSignin';
import StreamerOnBoarding from './components/StreamerOnBoarding/StreamerOnBoarding';
import StreamerProfile from './components/StreamerProfile/StreamerProfile';
import NewStream from './components/NewStream/NewStream';
import EventSent from './components/EventSent/EventSent';
import EditStreamerEvent from './components/EditStreamerEvent/EditStreamerEvent';
import PubSubTest from './components/PubSubTest/PubSubTest';
import LiveDonations from './components/LiveDonations/LiveDonations';
import Settings from './components/Settings/Settings';
import PlanPicker from './components/PlanPicker/PlanPicker';
// import Lottery from './components/Lottery/Lottery';
import StreamsPackages from './components/StreamsPackages/StreamsPackages';
import StreamerProfileEditor from './components/StreamerProfileEditor/StreamerProfileEditor';
import ChargeConfirmationPage from './components/ChargeConfirmationPage/ChargeConfirmationPage';

window.onbeforeunload = function() {
    return true;
};

// Remove navigation prompt
window.onbeforeunload = null;

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

        const permissions = localStorage.getItem('twitchPermission');
        const termsAndConditions = localStorage.getItem('termsAndConditions');

        if (user && (permissions !== 'channel:read:redemptions' || termsAndConditions !== 'true' )) {
            signOut();
        }

        if (!user) {
            loadGamesResources();
            checkIfUserIsAuthenticated();
        }
    }, [user]);

    return (
        <RouterPackage>
            <Switch>
                <Route exact path='/'>
                    <InviteCode user={user}/>
                </Route>
                <Route exact path='/signin/:inviteCode'>
                    <StreamersSignin title='Create your account' />
                </Route>
                <Route exact path='/signin'>
                    <StreamersSignin user={user} title='Welcome back!' />
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
                <Route exact path='/stream/:streamId'>
                    <PubSubTest user={user} />
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
                    <StreamerProfileEditor user={user}/>
                </Route>
                <Route exact path='/successCheckout'>
                    <ChargeConfirmationPage user={user}/>
                </Route>
                {/* <Route exact path='/lottery'>
                    <Lottery user={user} />
                </Route> */}
            </Switch>
        </RouterPackage>
    );
}

export default Router;
