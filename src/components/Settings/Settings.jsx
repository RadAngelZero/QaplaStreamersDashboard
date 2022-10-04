import React, { useState } from 'react';

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import QaplaTabs from '../QaplaTabs/QaplaTabs';
import QaplaTab from '../QaplaTabs/QaplaTab';
import CheersSettings from './CheersSettings';
import ChatbotCommandSettings from './ChatbotCommandSettings';
import { Box } from '@material-ui/core';

const Settings = ({ user }) => {
    const [value, setValue] = useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <StreamerDashboardContainer user={user}>
            <QaplaTabs value={value} onChange={handleChange}>
                <QaplaTab label='Cheers' />
                <QaplaTab label='ChatBot Command' />
            </QaplaTabs>
            {/* Both components exists and are loaded but we only show the selected component */}
            {user && user.uid && user.id &&
                <Box display={value === 0 ? 'block' : 'none'}>
                    <CheersSettings uid={user.uid} twitchId={user.id} />
                </Box>
            }
            {user && user.uid && user.id &&
                <Box display={value === 1 ? 'block' : 'none'}>
                    <ChatbotCommandSettings uid={user.uid} />
                </Box>
            }
        </StreamerDashboardContainer>
    );
}

export default Settings;