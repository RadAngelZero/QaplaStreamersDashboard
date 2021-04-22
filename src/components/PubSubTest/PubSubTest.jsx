import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { connect, listen, createCustomReward } from '../../services/twitch';
import { signOut } from '../../services/auth';

const PubSubTest = ({ user }) => {
    const history = useHistory();
    useEffect(() => {
        async function getChannelData() {
            /* listen([`channel-points-channel-v1.${user.id}`], user.twitchAccessToken, user.uid, () => {
                alert('Your session has expired please login again to continue');
                signOut();
                history.push('/signin');
            }); */
        }

        async function createReward() {
            createCustomReward(user.uid, user.id, user.twitchAccessToken, 'Qapla Custom Reward Testing', 500, () => {
                alert('Your session has expired please login again to continue');
                signOut();
                history.push('/signin');
            });
        }

        if (user) {
            /* connect(user.uid, user.twitchAccessToken);
            getChannelData(); */
            createReward();
        }
    }, [user, history]);

    return (
        <div>
            Testing
        </div>
    );
}

export default PubSubTest;
