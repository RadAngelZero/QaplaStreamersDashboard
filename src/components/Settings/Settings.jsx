import React, { useState } from 'react';

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import QaplaTabs from '../QaplaTabs/QaplaTabs';
import QaplaTab from '../QaplaTabs/QaplaTab';
import CheersSettings from './CheersSettings';

const Settings = ({ user }) => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <StreamerDashboardContainer user={user}>
            <QaplaTabs value={value} onChange={handleChange}>
                <QaplaTab label='Cheers' />
            </QaplaTabs>
            {user && user.uid && user.id &&
                <CheersSettings uid={user.uid} twitchId={user.id} />
            }
        </StreamerDashboardContainer>
    );
}

export default Settings;