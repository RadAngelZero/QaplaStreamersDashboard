import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as RouterPackage,
    Switch,
    Route
} from 'react-router-dom';
import { Helmet } from 'react-helmet';

import './App.css';
import {
    loadStreamerProfile,
    loadQaplaGames
} from './services/database';
import { handleUserAuthentication } from './services/auth';
import InviteCode from './components/InviteCode/InviteCode';
import StreamersSignin from './components/StreamersSignin/StreamersSignin';
import StreamerOnBoarding from './components/StreamerOnBoarding/StreamerOnBoarding';
import StreamerProfile from './components/StreamerProfile/StreamerProfile';
import NewStream from './components/NewStream/NewStream';
import EventSent from './components/EventSent/EventSent';
import EditStreamerEvent from './components/EditStreamerEvent/EditStreamerEvent';

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

        loadGamesResources();
        checkIfUserIsAuthenticated();
    }, []);


    return (
        <RouterPackage>
            <Helmet>
                <title>Streamer Dashboard</title>
            </Helmet>
            <Switch>
                <Route exact path='/'>
                    <InviteCode user={user}/>
                </Route>
                <Route exact path='/signin/:inviteCode'>
                    <StreamersSignin />
                </Route>
                <Route exact path='/signin'>
                    <StreamersSignin user={user} />
                </Route>
                {user &&
                    <>
                        <Route exact path='/welcome'>
                            <StreamerOnBoarding user={user} />
                        </Route>
                        <Route exact path='/create'>
                            <NewStream user={user} games={games}/>
                        </Route>
                        <Route exact path='/edit/:eventId'>
                            <EditStreamerEvent user={user} games={games}/>
                        </Route>
                        <Route exact path='/profile'>
                            <StreamerProfile user={user} />
                        </Route>
                        <Route exact path='/success'>
                            <EventSent user={user} />
                        </Route>
                    </>
                }
            </Switch>
        </RouterPackage>
    );
}

export default Router;
