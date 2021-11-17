import React, { useState, useEffect } from 'react';
import { useParams, Prompt } from 'react-router';
import {
    makeStyles,
    withStyles,
    TableCell,
    Grid,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    Avatar,
    CircularProgress,
    Snackbar,
    List,
    ListItem,
    LinearProgress,
    ListItemIcon,
    ListItemText,
    Typography,
    Box
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ProfileIcon } from './../../assets/ProfileIcon.svg';
import { ReactComponent as ConnectedIcon } from './../../assets/ganado.svg';
import { ReactComponent as DisconnectedIcon } from './../../assets/perdido.svg';

import { connect, createCustomReward, deleteCustomReward, closeConnection, getAllRewardRedemptions, enableCustomReward, disableCustomReward } from '../../services/twitch';
import { signInWithTwitch } from '../../services/auth';
import ContainedButton from '../ContainedButton/ContainedButton';
import {
    updateStreamerProfile,
    listenCustomRewardRedemptions,
    getStreamTimestamp,
    getStreamCustomReward,
    markAsClosedStreamerTwitchCustomReward,
    removeActiveCustomRewardFromList,
    getOpenCustomRewards,
    setStreamInRedemptionsLists,
    addListToStreamRedemptionList,
    saveStreamerTwitchCustomReward
} from '../../services/database';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { XQ, QOINS, TWITCH_PUBSUB_UNCONNECTED, TWITCH_PUBSUB_CONNECTED, TWITCH_PUBSUB_CONNECTION_LOST, HOUR_IN_MILISECONDS } from '../../utilities/Constants';
import { distributeStreamRedemptionsRewards } from '../../services/functions';
import { notifyBugToDevelopTeam } from '../../services/discord';
import CloseStreamDialog from '../CloseStreamDialog/CloseStreamDialog';

const useStyles = makeStyles((theme) => ({
    tableHead: {
        fontSize: '16px !important',
        color: '#808191 !important',
        fontWeight: 'bold'
    },
    tableRow: {
        backgroundColor: 'rgba(20, 24, 51, .5)'
    },
    tableRowOdd: {
        backgroundColor: 'transparent'
    },
    firstCell: {
        borderRadius: '1rem 0 0 1rem',
    },
    lastCell: {
        borderRadius: '0 1rem 1rem 0',
    },
    avatar: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        marginLeft: '.25rem'
    },
    tableContainer: {
        marginTop: 16
    },
    secondaryButton: {
        backgroundColor: '#00FFDD !important',
        marginTop: 16,
        color: '#000'
    },
    whiteColor: {
        color: '#FFF'
    },
    linearProgressBackgroundColor: {
        backgroundColor: '#0AFFD2'
    },
    greenQaplaColor: {
        color: '#0AFFD2'
    }
}));

const TableCellStyled = withStyles(() => ({
    root: {
        borderColor: 'transparent',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        fontSize: '14px',
        color: '#FFFFFF'
    }
}))(TableCell);

const CLOSING_STREAM_STEPS = 4;

const CloseStreamStep = ({ label, currentStep, step, progress }) => {
    const classes = useStyles();
    const percentageProgress = progress * 100;

    return (
        <ListItem style={{ display: 'flex', marginBottom: 16 }}>
            <ListItemIcon>
                {step === currentStep ?
                    <Box display='flex' flexDirection='column' alignItems='center'>
                        <Box width='100%' mr={1}>
                            <LinearProgress classes={{ barColorPrimary: classes.linearProgressBackgroundColor }} variant='determinate' value={percentageProgress} />
                        </Box>
                        <br />
                        <Box minWidth={35}>
                            <Typography className={classes.whiteColor}>{`${Math.round(
                            percentageProgress,
                            )}%`}</Typography>
                        </Box>
                    </Box>
                    :
                    currentStep > step &&
                        <CheckCircleIcon className={classes.greenQaplaColor} />
                }
            </ListItemIcon>
            <ListItemText>
                {label}
            </ListItemText>
        </ListItem>
    );
}

const PubSubTest = ({ user }) => {
    const { streamId } = useParams();
    const classes = useStyles();
    const { t } = useTranslation();

    const [connectedToTwitch, setConnectedToTwitch] = useState(false);
    const [verifyngRedemptions, setVerifyngRedemptions] = useState(false);
    const [rewardsIds, setRewardsIds] = useState({});
    const [isQoinsRewardEnabled, setIsQoinsRewardEnabled] = useState(false);
    const [oldUser, setOldUser] = useState({ twitchAccessToken: '' });
    const [streamTimestamp, setStreamTimestamp] = useState(0);
    const [usersThatRedeemed, setUsersThatRedeemed] = useState({});
    const [buttonFirstText, setButtonFirstText] = useState(t('handleStream.connect'));
    const [eventIsAlreadyClosed, setEventIsAlreadyClosed] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState(TWITCH_PUBSUB_UNCONNECTED);
    const [statusMessage, setStatusMessage] = useState('');
    const [currentCloseStep, setCurrentCloseStep] = useState({ step: -1, progress: 0 });

    let pingTimeout;

    useEffect(() => {
        async function getTimestamp() {
            if (streamId) {
                const timestamp = await getStreamTimestamp(streamId);
                if (timestamp.exists()) {
                    setStreamTimestamp(timestamp.val());
                }
            }
        }

        async function checkIfStreamIsAlreadyOpen() {
            if (user && user.uid && Object.keys(rewardsIds).length < 2) {
                const rewardOnDatabase = await getStreamCustomReward(user.uid, streamId);
                if (rewardOnDatabase.exists()){
                    if (rewardOnDatabase.val().closedStream) {
                        setEventIsAlreadyClosed(true);
                    } else {
                        setButtonFirstText(t('handleStream.reconnect'));
                    }
                }
            }
        }

        listenCustomRewardRedemptions(streamId, (users) => {
            if (users.exists()) {
                let usersToSave = {};
                users.forEach((user) => {
                    if (usersToSave[user.val().id]) {
                        usersToSave[user.val().id].numberOfRedemptions++;
                    } else {
                        usersToSave[user.val().id] = user.val();
                        usersToSave[user.val().id].numberOfRedemptions = 1;
                    }
                });

                setUsersThatRedeemed(usersToSave);
            }
        });

        if (rewardsAreCreated() && user.twitchAccessToken !== oldUser.twitchAccessToken) {
            const qoinsMaximumRedemptionsPerStream = (user.subscriptionDetails && parseInt(user.subscriptionDetails.redemptionsPerStream)) ? parseInt(user.subscriptionDetails.redemptionsPerStream) : 35;
            connect(streamId, user.displayName, user.uid, user.twitchAccessToken, user.refreshToken, [`channel-points-channel-v1.${user.id}`], rewardsIds, onPong, qoinsMaximumRedemptionsPerStream, handleTwitchSignIn);
            setOldUser(user);
        }

        checkIfStreamIsAlreadyOpen();
        getTimestamp();
        if (connectedToTwitch) {
            window.onbeforeunload = () => true;
        }

        return (() => {
            window.onbeforeunload = null;
        });
    }, [streamId, connectedToTwitch, user, rewardsIds, oldUser, streamTimestamp]);

    const listenForRewards = async () => {
        const userCredentialsUpdated = await handleTwitchSignIn();

        const rewardOnDatabase = await getStreamCustomReward(user.uid, streamId);

        if (rewardOnDatabase.exists()){
            if (!rewardOnDatabase.val().closedStream) {
                let rewards = { expReward: rewardOnDatabase.val().expReward.rewardId, qoinsReward: rewardOnDatabase.val().qoinsReward.rewardId }
                setRewardsIds(rewards);

                // Get redemptions lists
                const lists = await getRedemptionsLists(rewards, userCredentialsUpdated);
                distributeStreamRedemptionsRewards(user.uid, user.displayName, streamId, XQ, lists.XQRedemptions);
                distributeStreamRedemptionsRewards(user.uid, user.displayName, streamId, QOINS, lists.QoinsRedemptions);

                const qoinsMaximumRedemptionsPerStream = (user.subscriptionDetails && parseInt(user.subscriptionDetails.redemptionsPerStream)) ? parseInt(user.subscriptionDetails.redemptionsPerStream) : 35;
                connect(streamId, user.displayName, user.uid, userCredentialsUpdated.access_token, userCredentialsUpdated.refresh_token, [`channel-points-channel-v1.${user.id}`], rewards, onPong, qoinsMaximumRedemptionsPerStream, handleTwitchSignIn);
                setOldUser(user);
                setConnectedToTwitch(true);
                setStatusMessage(t('handleStream.reconnected'));
            } else {
                alert(t('handleStream.streamClosed'));
            }
        } else {
            const currentDate = new Date();
            const streamScheduledDate = new Date(streamTimestamp);
            if (user.id === '213807528' || currentDate.getTime() <= (streamScheduledDate.getTime() + (HOUR_IN_MILISECONDS * 2))) {
                setStatusMessage(t('handleStream.connecting'));
                const rewards = await createReward(userCredentialsUpdated);

                if (rewards) {
                    const qoinsMaximumRedemptionsPerStream = (user.subscriptionDetails && parseInt(user.subscriptionDetails.redemptionsPerStream)) ? parseInt(user.subscriptionDetails.redemptionsPerStream) : 35;
                    connect(streamId, user.displayName, user.uid, userCredentialsUpdated.access_token, userCredentialsUpdated.refresh_token, [`channel-points-channel-v1.${user.id}`], rewards, onPong, qoinsMaximumRedemptionsPerStream, handleTwitchSignIn);
                    setOldUser(user);
                    setConnectedToTwitch(true);
                } else {
                    alert('Qapla Custom Reward couldn´t been created');
                }
            } else {
                alert(t('handleStream.timeError'));
            }
        }
    }

    const onPong = () => {
        clearTimeout(pingTimeout);
        setConnectionStatus(TWITCH_PUBSUB_CONNECTED);
        setConnectedToTwitch(true);
        pingTimeout = setTimeout(() => {
            setConnectionStatus(TWITCH_PUBSUB_CONNECTION_LOST);
            setConnectedToTwitch(false);
            const qoinsMaximumRedemptionsPerStream = (user.subscriptionDetails && parseInt(user.subscriptionDetails.redemptionsPerStream)) ? parseInt(user.subscriptionDetails.redemptionsPerStream) : 35;
            connect(streamId, user.displayName, user.uid, user.twitchAccessToken, user.refreshToken, [`channel-points-channel-v1.${user.id}`], rewardsIds, onPong, qoinsMaximumRedemptionsPerStream, handleTwitchSignIn);
        }, 25000);
    }

    const createReward = async (userCredentials) => {
        let date = new Date();
        if (date.getTime() >= streamTimestamp - 900000) {
            let rewardsIdsObject = { expReward: '', qoinsReward: '' };
            const qoinsMaximumRedemptionsPerStream = (user.subscriptionDetails && parseInt(user.subscriptionDetails.redemptionsPerStream)) ? parseInt(user.subscriptionDetails.redemptionsPerStream) : 35;
            const expReward = await createCustomReward(user.uid, user.id, userCredentials.access_token, userCredentials.refresh_token, 'XQ Qapla', 500, false, handleTwitchSignIn, false, 0, true, 1);
            if (expReward.status === 200) {
                rewardsIdsObject.expReward = expReward.data.id;
            } else {
                if (expReward.status === 400) {
                    return await handleDuplicatedCustomReward(XQ, expReward);
                }
            }

            const qoinsReward = await createCustomReward(user.uid, user.id, userCredentials.access_token, userCredentials.refresh_token, 'Qoins Qapla', 500, false, handleTwitchSignIn, true, qoinsMaximumRedemptionsPerStream, true, 1);
            if (qoinsReward.status === 200) {
                rewardsIdsObject.qoinsReward = qoinsReward.data.id;
            } else {
                // Problem creating Qoins reward
                // Delete XQ reward
                await deleteCustomReward(user.uid, user.id, userCredentials.access_token, userCredentials.refresh_token, expReward.data.id, handleTwitchSignIn);

                let errorMessage = `Error creating Qoins Reward\nStatus: ${qoinsReward.status}`;
                if (qoinsReward.error) {
                    errorMessage += `\nError: ${qoinsReward.error}\nMessage: ${qoinsReward.message}\nStreamer: ${user.displayName}\nStream Id: ${streamId}`;
                }
                // Abort and notify Qapla developers
                notifyBugToDevelopTeam(errorMessage);

                if (qoinsReward.status === 400) {
                    return await handleDuplicatedCustomReward(QOINS, qoinsReward);
                }
            }

            if (expReward.status === 200 && qoinsReward.status === 200) {
                setRewardsIds({ expReward: expReward.data.id, qoinsReward: qoinsReward.data.id });
                await saveStreamerTwitchCustomReward(user.uid, 'expReward', expReward.data.id, expReward.data.title, expReward.data.cost, streamId);
                await saveStreamerTwitchCustomReward(user.uid, 'qoinsReward', qoinsReward.data.id, qoinsReward.data.title, qoinsReward.data.cost, streamId);

                // Enable XQ reward
                await enableCustomReward(user.uid, user.id, userCredentials.access_token, userCredentials.refresh_token, expReward.data.id, handleTwitchSignIn);
                setStatusMessage('');
                setStatusMessage(t('handleStream.rewardsCreated'));
            }

            return rewardsIdsObject;
        } else {
            alert('La conexion solo puede realizarse cuando mucho 15 minutos antes de la hora en que esta programado el evento');
        }

        return null;
    }

    const handleDuplicatedCustomReward = async (rewardType, rewardError) => {
        let rewardsIdsToDelete = { expReward: '', qoinsReward: '' };
        let streamIdToClose;
        const activeRewards = await getOpenCustomRewards(user.uid);
        if (activeRewards.exists()) {
            alert(t('handleStream.streamerHasAnOpenStream'));
            activeRewards.forEach((activeReward) => {
                rewardsIdsToDelete.expReward = activeReward.val().expReward.rewardId;
                rewardsIdsToDelete.qoinsReward = activeReward.val().qoinsReward.rewardId;
                streamIdToClose = activeReward.key;
            });
        }

        if (rewardsIdsToDelete.expReward && rewardsIdsToDelete.qoinsReward && streamIdToClose) {
            await finishStream(streamIdToClose, rewardsIdsToDelete);

            const userCredentialsUpdated = await handleTwitchSignIn();

            return await createReward(userCredentialsUpdated);
        } else {
            // Problem creating reward not caused by previous open stream
            let errorMessage = `Error creating ${rewardType} Reward\nStatus: ${rewardError.status}`;
            if (rewardError.error) {
                errorMessage += `\nError: ${rewardError.error}\nMessage: ${rewardError.message}\nStreamer: ${user.displayName}\nStream Id: ${streamId}`;
            }
            // Abort and notify Qapla developers
            notifyBugToDevelopTeam(errorMessage);

            alert(t('handleStream.rewardsCantBeRemoved'));
        }

        return null;
    }

    const deleteReward = async (rewardIdToDelete, userCredentials) => {
        const result = await deleteCustomReward(user.uid, user.id, userCredentials.access_token, userCredentials.refresh_token, rewardIdToDelete, handleTwitchSignIn);

        console.log(result);

        if (result === 404 || result === 403) {
            alert(`No se encontro la recompensa a eliminar, status: ${result}`);
        } else if (result === 500) {
            alert('Error de parte de Twitch al tratar de eliminar la recompensa');
        }
    }

    const handleTwitchSignIn = async () => {
        let user = await signInWithTwitch();
        await updateStreamerProfile(user.firebaseAuthUser.user.uid, user.userData);

        user.access_token = user.userData.twitchAccessToken;
        user.refresh_token = user.userData.refreshToken;
        return user;
    }

    const unlistenForRewards = async () => {
        if (window.confirm(t('handleStream.closeStreamConfirmation'))) {
            await closeStream();
        }
    }

    const closeStream = async () => {
        closeConnection();

        finishStream(streamId, rewardsIds);
    }

    const finishStream = async (streamIdToClose, rewardsIdsToDelete) => {
        setVerifyngRedemptions(true);
        const userCredentialsUpdated = await handleTwitchSignIn();

        const rewardsIdToDeleteArray = Object.keys(rewardsIdsToDelete).map((reward) => rewardsIdsToDelete[reward]);

        setCurrentCloseStep({ step: 0, progress: 0 });
        // Disable custom rewards on Twitch
        for (let i = 0; i < rewardsIdToDeleteArray.length; i++) {
            await disableCustomReward(user.id, userCredentialsUpdated.access_token, rewardsIdToDeleteArray[i], handleTwitchSignIn);
            setCurrentCloseStep({ step: 0, progress: (i + 1) / rewardsIdToDeleteArray.length  });
        }

        // Remove the custom reward from the ActiveCustomReward node on the database
        await removeActiveCustomRewardFromList(streamIdToClose);

        // Get redemptions lists
        const lists = await getRedemptionsLists(rewardsIdsToDelete, userCredentialsUpdated);

        // Save the lists of redemptions on database
        await saveRedemptionsLists(lists);

        setCurrentCloseStep({ step: 3, progress: 0 });
        // Delete the rewards. This lines can not never be before the saveRedemptionsLists function call
        for (let i = 0; i < rewardsIdToDeleteArray.length; i++) {
            await deleteReward(rewardsIdToDeleteArray[i], userCredentialsUpdated);
            setCurrentCloseStep({ step: 3, progress: (i + 1) / rewardsIdToDeleteArray.length });
        }

        setCurrentCloseStep({ step: 4, progress: 0 });
        // Mark as closed the stream on the database
        await markAsClosedStreamerTwitchCustomReward(user.uid, streamIdToClose);
        setCurrentCloseStep({ step: 4, progress: 1 });

        // Call cloud functions tu distribute XQ and Qoins
        distributeStreamRedemptionsRewards(user.uid, user.displayName, streamId, XQ, lists.XQRedemptions);
        distributeStreamRedemptionsRewards(user.uid, user.displayName, streamId, QOINS, lists.QoinsRedemptions);

        setCurrentCloseStep({ step: 5, progress: 0 });

        setRewardsIds({});

        setVerifyngRedemptions(false);
        setConnectedToTwitch(false);

        // alert(t('handleStream.rewardsSent'));
    }

    const getRedemptionsLists = async (rewardsIdsToGet, userCredentials) => {
        setCurrentCloseStep({ step: 1, progress: 0 });
        const XQRedemptions = await getAllRewardRedemptions(user.id, userCredentials.access_token, rewardsIdsToGet.expReward);
        setCurrentCloseStep({ step: 1, progress: 0.5 });
        const QoinsRedemptions = await getAllRewardRedemptions(user.id, userCredentials.access_token, rewardsIdsToGet.qoinsReward);
        setCurrentCloseStep({ step: 1, progress: 1 });

        return { XQRedemptions, QoinsRedemptions };
    }

    const saveRedemptionsLists = async (lists) => {
        setStreamInRedemptionsLists(streamId);
        setCurrentCloseStep({ step: 2, progress: 0 });
        await addListToStreamRedemptionList(streamId, 'XQReward', lists.XQRedemptions);
        setCurrentCloseStep({ step: 2, progress: 0.5 });
        await addListToStreamRedemptionList(streamId, 'QoinsReward', lists.QoinsRedemptions);
        setCurrentCloseStep({ step: 2, progress: 1 });
    }

    const enableQoinsReward = async () => {
        const userCredentialsUpdated = await handleTwitchSignIn();
        if (await enableCustomReward(user.uid, user.id, userCredentialsUpdated.access_token, userCredentialsUpdated.refresh_token, rewardsIds.qoinsReward, handleTwitchSignIn) === 200) {
            setIsQoinsRewardEnabled(true);
        }
    }

    const rewardsAreCreated = () => Object.keys(rewardsIds).length === 2;

    return (
        <StreamerDashboardContainer user={user}>
            <Prompt when={connectedToTwitch}
                message='If you leave now you will lose the connection with Twitch and the rewards will not be sent in real time to the users' />
            <Grid container>
                <Grid xs={5} container>
                    <Grid xs={6}>
                        <ContainedButton onClick={!connectedToTwitch ? listenForRewards : unlistenForRewards}
                            disabled={verifyngRedemptions || eventIsAlreadyClosed}
                            endIcon={verifyngRedemptions ? <CircularProgress style={{ color: '#FFF' }} /> : null}>
                            {verifyngRedemptions ?
                                t('handleStream.sendingRewards')
                            :
                                !connectedToTwitch ? eventIsAlreadyClosed ? t('handleStream.streamClosed') : buttonFirstText : t('handleStream.endStream')
                            }
                        </ContainedButton>
                        {(connectedToTwitch && !isQoinsRewardEnabled) &&
                            <ContainedButton onClick={enableQoinsReward} className={classes.secondaryButton}>
                                {t('handleStream.enableQoinsReward')}
                            </ContainedButton>
                        }
                        {(!eventIsAlreadyClosed && connectionStatus !== TWITCH_PUBSUB_UNCONNECTED) &&
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
                                {connectionStatus === TWITCH_PUBSUB_CONNECTED ?
                                    <ConnectedIcon height={32} width={32} />
                                    :
                                    <DisconnectedIcon height={32} width={32} />
                                }
                                {connectionStatus === TWITCH_PUBSUB_CONNECTED ?
                                    <p style={{ color: '#0AFFD2', marginLeft: 8 }}>
                                        Conectado
                                    </p>
                                    :
                                    <p style={{ color: '#FF0000', marginLeft: 8 }}>
                                        Error de conexión. Reconectando...
                                    </p>
                                }
                            </div>
                        }
                    </Grid>
                </Grid>
                {Object.keys(usersThatRedeemed).length > 0 &&
                    <Grid xs={4}>
                        <TableContainer className={classes.tableContainer}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCellStyled align='center' padding='checkbox'>
                                            <ProfileIcon />
                                        </TableCellStyled>
                                        <TableCellStyled className={classes.tableHead}>Twitch Username</TableCellStyled>
                                        <TableCellStyled className={classes.tableHead}>Nº of Redemptions</TableCellStyled>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.keys(usersThatRedeemed).map((uid, index) => (
                                        <TableRow className={index % 2 === 0 ? classes.tableRow : classes.tableRowOdd}
                                            key={`Participant-${uid}`}>
                                            <TableCellStyled align='center' className={classes.firstCell}>
                                                <Avatar
                                                    className={classes.avatar}
                                                    src={usersThatRedeemed[uid].photoUrl} />
                                            </TableCellStyled>
                                            <TableCellStyled>
                                                {usersThatRedeemed[uid].displayName}
                                            </TableCellStyled>
                                            <TableCellStyled className={classes.lastCell}>
                                                {usersThatRedeemed[uid].numberOfRedemptions}
                                            </TableCellStyled>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                }
            </Grid>
            <CloseStreamDialog open={currentCloseStep.step !== -1}
                onClose={() => setCurrentCloseStep({ step: -1, progress: 0 })}
                finished={currentCloseStep.step > CLOSING_STREAM_STEPS}>
                <List className={classes.whiteColor}>
                    <CloseStreamStep label={t('handleStream.closingStreamSteps.0')}
                        currentStep={currentCloseStep.step}
                        step={0}
                        progress={currentCloseStep.progress} />

                    <CloseStreamStep label={t('handleStream.closingStreamSteps.1')}
                        currentStep={currentCloseStep.step}
                        step={1}
                        progress={currentCloseStep.progress} />

                    <CloseStreamStep label={t('handleStream.closingStreamSteps.2')}
                        currentStep={currentCloseStep.step}
                        step={2}
                        progress={currentCloseStep.progress} />

                    <CloseStreamStep label={t('handleStream.closingStreamSteps.3')}
                        currentStep={currentCloseStep.step}
                        step={3}
                        progress={currentCloseStep.progress} />

                    <CloseStreamStep label={t('handleStream.closingStreamSteps.4')}
                        currentStep={currentCloseStep.step}
                        step={4}
                        progress={currentCloseStep.progress} />
                </List>
            </CloseStreamDialog>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={statusMessage !== ''}
                autoHideDuration={5000}
                onClose={() => setStatusMessage('')}
                message={statusMessage} />
        </StreamerDashboardContainer>
    );
}

export default PubSubTest;
