import React, { useEffect, useState } from 'react';
import { Avatar, Grid, Button, Card, CardContent, Box, IconButton } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

import styles from './StreamerProfile.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';
import { ReactComponent as AddIcon } from './../../assets/AddIcon.svg';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as OptionsIcon } from './../../assets/OptionsIcon.svg';
import StreamerSelect from '../StreamerSelect/StreamerSelect';
import { loadStreamsByStatus } from '../../services/database';

const SCEHDULED_EVENT_TYPE = 'SCHEDULED';
const PENDING_APPROVAL_EVENT_TYPE = 'PENDING_APPROVAL';
const PAST_STREAMS_EVENT_TYPE = 'PAST_STREAMS';

const StreamerProfile = ({ user }) => {
    const history = useHistory();
    const [streamType, setStreamType] = useState('scheduled');
    const [streams, setStreams] = useState({});

    useEffect(() => {
        function setStreamLoaded(streams) {
            if (streams.exists()) {
                setStreams(streams.val());
            }
        }

        async function loadStreams() {
            if (user) {
                let status = 0;
                switch (streamType) {
                    case SCEHDULED_EVENT_TYPE:
                        status = 2;
                        break;
                    case PENDING_APPROVAL_EVENT_TYPE:
                        status = 1;
                        break;
                    case PAST_STREAMS_EVENT_TYPE:
                        status = 3;
                        break;
                    default:
                        break;
                }

                setStreamLoaded(await loadStreamsByStatus(user.uid, status));
            }
        }

        loadStreams();
    }, [streamType, user]);

    const createStream = () => history.push('/create');

    const streamDetails = () => history.push('/edit/Nio928nje');

    const changestreamType = (e) => setStreamType(e.target.value);

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
                            <Grid item md={3}>
                                <Card className={styles.eventCard} onClick={streamDetails}>
                                    <div style={{ overflow: 'hidden' }}>
                                        <img
                                            alt='Rocket'
                                            src='https://rocketleague.media.zestyio.com/rl_platform_keyart_2019.f1cb27a519bdb5b6ed34049a5b86e317.jpg'
                                            height='160'
                                            style={{
                                                objectFit: 'cover',
                                                backgroundSize: 'cover',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'center'
                                            }} />
                                    </div>
                                    <CardContent className={styles.eventCardContent}>
                                        <p className={styles.eventCardTitle}>
                                            {streams[streamId].game}
                                        </p>
                                        <div className={styles.rowContainer}>
                                            <div className={styles.circle} />
                                            <p className={styles.participantsNumber}>
                                                {streams[streamId].participants || 0}
                                            </p>
                                        </div>
                                        <div className={styles.dateContainer}>
                                            <div className={styles.rowContainer}>
                                                <CalendarIcon />
                                                <p className={styles.date}>
                                                    {streams[streamId].date}
                                                </p>
                                            </div>
                                            <OptionsIcon />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default StreamerProfile;