import React, { useEffect, useState } from 'react';
import { withStyles, makeStyles, Grid, AccordionSummary, Avatar, Button, Card, CardContent, Box, IconButton, Hidden, Tooltip } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import styles from './StreamerProfile.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { ReactComponent as TwitchIcon } from './../../assets/twitchIcon.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';
import { ReactComponent as AddIcon } from './../../assets/AddIcon.svg';
import { ReactComponent as DonatedQoin } from './../../assets/DonatedQoin.svg';
import { ReactComponent as BitsIcon } from './../../assets/BitsIcon.svg';
import { ReactComponent as QoinsIcon } from './../../assets/QoinsIcon.svg';
import { ReactComponent as InfoSquare } from './../../assets/InfoSquare.svg';
import { ReactComponent as Arrow } from './../../assets/Arrow.svg';

import StreamerSelect from '../StreamerSelect/StreamerSelect';
import { loadStreamsByStatus } from '../../services/database';
import StreamCard from '../StreamCard/StreamCard';
import {
    SCEHDULED_EVENT_TYPE,
    PENDING_APPROVAL_EVENT_TYPE,
    PAST_STREAMS_EVENT_TYPE
} from '../../utilities/Constants';
import CheersBitsRecordDialog from '../CheersBitsRecordDialog/CheersBitsRecordDialog';

const BalanceInfoTooltip = withStyles(() => ({
    tooltip: {
        fontSize: 16,
        color: '#FFF',
        backgroundColor: '#3B4BF9',
        fontWeight: 500,
        paddingTop: 6,
        paddingBottom: 6,
        paddingRight: 24,
        paddingLeft: 24,
        borderRadius: 16,
        maxWidth: 200
    },
    arrow: {
        color: '#3B4BF9'
    }
}))(Tooltip);

const useStyles = makeStyles(() => ({
    accordionSummary: {
        justifyContent: "flex-end"
    },
    currencyContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end'
    }
}));

const CheersBalanceCard = ({ user }) => {
    const [openBalanceTooltip, setOpenBalanceTooltip] = useState(false);
    const [openRecordsDialog, setOpenRecordsDialog] = useState(false);
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <div className={styles.balanceInfoContainer}>
            <div className={styles.cheersTitleContainer}
                style={{ background: user.premium ? 'transparent' : 'linear-gradient(270deg, #3B4BF9 0%, #7E00FC 100%)' }}>
                <p className={styles.cheersText}>
                    {t('StreamerProfile.cheersBalance')}
                </p>
            </div>
            <div className={styles.balanceContainer}>
                {!user.premium &&
                    <div className={styles.getPremiumBannerContainer}>
                        <p className={styles.getPremiumBannerText}>
                            {t('StreamerProfile.premiumBenefits')}
                        </p>
                    </div>
                }
                <div className={classes.currencyContainer}>
                    <div>
                        <div className={user.premium ? '' : styles.blur}>
                            <div className={styles.balanceCurrencyContainer}>
                                <p className={styles.balanceCurrencyValue}>
                                    {user.bitsBalance || 0}
                                </p>
                                <BitsIcon />
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className={user.premium ? '' : styles.blur}>
                            <div className={styles.balanceCurrencyContainer}>
                                <p className={styles.balanceCurrencyValue}>
                                    {user.qoinsBalance || 0}
                                </p>
                                <QoinsIcon />
                            </div>
                        </div>
                    </div>
                </div>
                <Grid xs={12}>
                    <div className={user.premium ? '' : styles.blur}>
                        {/**
                         * AccordionSummary only used for UI purposes, we are not using any Accordion component here
                         */}
                        <AccordionSummary className={styles.historyAccordion}
                            expandIcon={<Arrow style={{ rotate: '-90deg' }} />}
                            classes={{ content: classes.accordionSummary }}
                            onClick={() => setOpenRecordsDialog(true)}>
                            <p className={styles.historyText}>
                                {t('StreamerProfile.receivedCheers')}
                            </p>
                        </AccordionSummary>
                        <CheersBitsRecordDialog open={openRecordsDialog}
                            onClose={() => setOpenRecordsDialog(false)}
                            user={user} />
                    </div>
                </Grid>
            </div>
            <div className={`${styles.displayFlex} ${styles.learnMoreContainer}`}>
                <BalanceInfoTooltip arrow
                    onClose={() => setOpenBalanceTooltip(false)}
                    open={openBalanceTooltip}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title={<div><p>{t('StreamerProfile.cheersBalanceTooltip.title')}</p> <p> {t('StreamerProfile.cheersBalanceTooltip.description')} </p></div>}>
                    <IconButton onClick={() => setOpenBalanceTooltip(!openBalanceTooltip)} size='small'>
                        <InfoSquare />
                    </IconButton>
                </BalanceInfoTooltip>
                <p className={styles.learnMoreText}>
                    {t('StreamerProfile.learnMore')}
                </p>
            </div>
        </div>
    );
};

const StreamerProfile = ({ user, games }) => {
    const history = useHistory();
    const [streamType, setStreamType] = useState(SCEHDULED_EVENT_TYPE);
    const [streams, setStreams] = useState({});
    const { t } = useTranslation();

    useEffect(() => {
        function setStreamLoaded(streams) {
            if (streams.exists()) {
                setStreams(streams.val());
            } else {
                setStreams({});
            }
        }

        async function loadStreams() {
            if (user) {
                setStreamLoaded(await loadStreamsByStatus(user.uid, streamType));
            } else {
                history.push('/');
            }
        }

        loadStreams();
    }, [streamType, user, history]);

    const createStream = () => {
        if (user.premium) {
            history.push('/create');
        }
    }

    const goToStreamDetails = (streamId) => history.push({ pathname: `/edit/${streamId}`, state: { streamType }});

    const changestreamType = (e) => setStreamType(parseInt(e.target.value));

    /**
     * Format the date to show in the card
     * @param {string} date date in format DD-MM-YYYY
     * @example formatDate("12-02-2021") returns 12 Feb 2021
     */
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sept', 'Oct', 'Nov', 'Dic'];
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    const formatHour = (timestamp) => {
        const date = new Date(timestamp);
        const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
        const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

        return `${hour}:${minutes}`;
    }

    const onRemoveStream = (streamId) => {
        const streamsCopy = {...streams};
        delete streamsCopy[streamId];
        setStreams(streamsCopy);
    }

    return (
        <StreamerDashboardContainer user={user}>
            {user &&
                <>
                    <Box display="flex" flexDirection="row" >
                        <Hidden lgUp>
                            <div style={{ width: '45px' }}></div>
                        </Hidden>
                        <div className={styles.avatarContainer}>
                            <Avatar
                                alt='User image'
                                src={user.photoUrl} />
                            <span className={styles.streamerName}>{user.displayName}</span>
                        </div>
                    </Box>
                    <Grid container>
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid xs={12} sm={7}>
                                    <Grid item xs={12}>
                                        <Button variant='contained'
                                            className={styles.twitchButton}
                                            onClick={() => window.open(`https://www.twitch.tv/${user.displayName}`, '_blank')}
                                            startIcon={<TwitchIcon />}>
                                            {user.displayName}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container style={{ marginTop: '6rem' }}>
                                            <Hidden xsDown>
                                                <div style={{ position: 'absolute', top: 48, right: 32, widt: 360, maxWidth: 420 }}>
                                                    <CheersBalanceCard user={user} />
                                                </div>
                                            </Hidden>
                                            <Hidden smUp>
                                                <Grid item xs={12}>
                                                    <CheersBalanceCard user={user} />
                                                </Grid>
                                            </Hidden>
                                            <Grid item xs={12} sm={3}>
                                                <h1 className={styles.title}>
                                                    {t('StreamerProfile.myStreams')}
                                                </h1>
                                            </Grid>
                                            <Grid item xs={12} sm={9}>
                                                <StreamerSelect
                                                    value={streamType}
                                                    onChange={changestreamType}
                                                    Icon={ArrowIcon}>
                                                    <option value={SCEHDULED_EVENT_TYPE}>
                                                        {t('StreamerProfile.scheduled')}
                                                    </option>
                                                    <option value={PENDING_APPROVAL_EVENT_TYPE}>
                                                        {t('StreamerProfile.pendingApproval')}
                                                    </option>
                                                    <option value={PAST_STREAMS_EVENT_TYPE}>
                                                        {t('StreamerProfile.pastStreams')}
                                                    </option>
                                                </StreamerSelect>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid xs={1} />
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={4}>
                                <Grid item xl={2} lg={3} md={3} sm={4} xs={10}>
                                    <Card className={styles.createEventCard} onClick={createStream}>
                                        <h1 className={styles.newStream} style={{ whiteSpace: 'pre-line' }}>
                                            {t('StreamerProfile.postStream')}
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
                                    <Grid item xl={2} lg={3} md={3} sm={4} xs={10} key={streamId}>
                                        <StreamCard
                                            streamType={streamType}
                                            streamId={streamId}
                                            user={user}
                                            game={streams[streamId].game}
                                            games={games}
                                            date={formatDate(streams[streamId].timestamp)}
                                            hour={formatHour(streams[streamId].timestamp)}
                                            enableOptionsIcon={streamType !== PAST_STREAMS_EVENT_TYPE}
                                            onClick={() => goToStreamDetails(streamId)}
                                            onRemoveStream={onRemoveStream} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            }
        </StreamerDashboardContainer>
    );
}

export default StreamerProfile;