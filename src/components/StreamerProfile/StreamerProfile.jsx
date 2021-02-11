import React, { useEffect, useState } from 'react';
import { Avatar, Grid, Button, Card, CardContent, Box, IconButton } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import styles from './StreamerProfile.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';
import { ReactComponent as AddIcon } from './../../assets/AddIcon.svg';
import StreamerSelect from '../StreamerSelect/StreamerSelect';
import { loadStreamsByStatus } from '../../services/database';
import StreamCard from '../StreamCard/StreamCard';
import {
    SCEHDULED_EVENT_TYPE,
    PENDING_APPROVAL_EVENT_TYPE,
    PAST_STREAMS_EVENT_TYPE
} from '../../utilities/Constants';

const StreamerProfile = ({ user, games }) => {
    const history = useHistory();
    const [streamType, setStreamType] = useState(SCEHDULED_EVENT_TYPE);
    const [streams, setStreams] = useState({});

    useEffect(() => {
        function setStreamLoaded(streams) {
            if (streams.exists()) {
                setStreams(streams.val());
            }
        }

        async function loadStreams() {
            if (user) {
                setStreamLoaded(await loadStreamsByStatus(user.uid, streamType));
            }
        }

        loadStreams();
    }, [streamType, user]);

    const createStream = () => history.push('/create');

    const goToStreamDetails = (streamId) => history.push(`/edit/${streamId}`);

    const changestreamType = (e) => setStreamType(parseInt(e.target.value));

    /**
     * Format the date to show in the card
     * @param {string} date date in format DD-MM-YYYY
     * @example formatDate("12-02-2021") returns 12 Feb 2021
     */
    const formatDate = (date) => {
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'];
        let [day, month, year] = date.split('-');
        month = parseInt(month) - 1; // Months array count start on zero
        return `${day} ${months[month]} ${year}`;
    }

    const onRemoveStream = (streamId) => {
        const streamsCopy = {...streams};
        delete streamsCopy[streamId];
        setStreams(streamsCopy);
    }

    return (
        <StreamerDashboardContainer user={user}>
            <div className={styles.avatarContainer}>
                <Avatar
                    alt='User image'
                    src={user.photoUrl} />
                <span className={styles.streamerName}>{user.displayName}</span>
            </div>
            <Grid container>
                <Grid item xs={12}>
                    <Button variant='contained'
                        className={styles.twitchButton}
                        startIcon={<TwitchIcon />}>
                        {user.displayName}
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={3}>
                            <h1 className={styles.title}>My events</h1>
                        </Grid>
                        <Grid item xs={9} style={{ marginTop: '6rem' }}>
                            <StreamerSelect
                                value={streamType}
                                onChange={changestreamType}
                                Icon={ArrowIcon}>
                                <option value={SCEHDULED_EVENT_TYPE}>Scheduled</option>
                                <option value={PENDING_APPROVAL_EVENT_TYPE}>Pending Approval</option>
                                <option value={PAST_STREAMS_EVENT_TYPE}>Past Streams</option>
                            </StreamerSelect>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container spacing={4}>
                        <Grid item md={3}>
                            <Card className={styles.createEventCard} onClick={createStream}>
                                <h1 className={styles.newStream}>
                                    New <br /> Stream
                                </h1>
                                <CardContent>
                                    <Box display='flex' justifyContent='center'>
                                        <IconButton className={styles.createButton}>
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                        {streams && Object.keys(streams).map((streamId) => (
                            <Grid item md={3} key={streamId}>
                                <StreamCard
                                    streamType={streamType}
                                    streamId={streamId}
                                    user={user}
                                    game={streams[streamId].game}
                                    title={games['allGames'][streams[streamId].game].name}
                                    date={formatDate(streams[streamId].date)}
                                    enableOptionsIcon={streamType === PENDING_APPROVAL_EVENT_TYPE}
                                    onClick={() => goToStreamDetails(streamId)}
                                    onRemoveStream={onRemoveStream} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default StreamerProfile;