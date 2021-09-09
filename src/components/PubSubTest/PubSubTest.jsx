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
    CircularProgress
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { ReactComponent as ProfileIcon } from './../../assets/ProfileIcon.svg';
import { ReactComponent as ConnectedIcon } from './../../assets/ganado.svg';
import { ReactComponent as DisconnectedIcon } from './../../assets/perdido.svg';

import { connect, createCustomReward, deleteCustomReward, closeConnection, getAllRewardRedemptions, enableCustomReward } from '../../services/twitch';
import { signInWithTwitch } from '../../services/auth';
import ContainedButton from '../ContainedButton/ContainedButton';
import {
    updateStreamerProfile,
    listenCustomRewardRedemptions,
    getStreamTimestamp,
    getStreamCustomReward,
    getUserByTwitchId,
    addQoinsToUser,
    addInfoToEventParticipants,
    saveUserStreamReward,
    giveStreamExperienceForRewardRedeemed,
    saveCustomRewardRedemption,
    markAsClosedStreamerTwitchCustomReward,
    removeActiveCustomRewardFromList,
    getOpenCustomRewards,
    setStreamInRedemptionsLists,
    addListToStreamRedemptionList,
    saveStreamerTwitchCustomReward,
    getStreamUserRedemptions,
    getStreamRedemptionCounter
} from '../../services/database';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { XQ, QOINS, TWITCH_PUBSUB_UNCONNECTED, TWITCH_PUBSUB_CONNECTED, TWITCH_PUBSUB_CONNECTION_LOST, HOUR_IN_MILISECONDS } from '../../utilities/Constants';



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
            connect(streamId, user.displayName, user.uid, user.twitchAccessToken, user.refreshToken, [`channel-points-channel-v1.${user.id}`], rewardsIds, onPong, user.subscriptionDetails.redemptionsPerStream || 35, handleTwitchSignIn);
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

                connect(streamId, user.displayName, user.uid, userCredentialsUpdated.access_token, userCredentialsUpdated.refresh_token, [`channel-points-channel-v1.${user.id}`], rewards, onPong, user.subscriptionDetails.redemptionsPerStream || 35, handleTwitchSignIn);
                setOldUser(user);
                setConnectedToTwitch(true);
                alert(t('handleStream.reconnected'));
            } else {
                alert(t('handleStream.streamClosed'));
            }
        } else {
            const currentDate = new Date();
            const streamScheduledDate = new Date(streamTimestamp);
            if (user.id === '613408163' || currentDate.getTime() <= (streamScheduledDate.getTime() + (HOUR_IN_MILISECONDS * 2))) {
                alert(t('handleStream.connecting'));
                const rewards = await createReward(userCredentialsUpdated);

                /* if (rewards) {
                    connect(streamId, user.displayName, user.uid, userCredentialsUpdated.access_token, userCredentialsUpdated.refresh_token, [`channel-points-channel-v1.${user.id}`], rewards, onPong, user.subscriptionDetails.redemptionsPerStream || 35, handleTwitchSignIn);
                    setOldUser(user);
                    setConnectedToTwitch(true);
                } else {
                    alert('Qapla Custom Reward couldn´t been created');
                } */
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
            connect(streamId, user.displayName, user.uid, user.twitchAccessToken, user.refreshToken, [`channel-points-channel-v1.${user.id}`], rewardsIds, onPong, user.subscriptionDetails.redemptionsPerStream || 35, handleTwitchSignIn);
        }, 16000);
    }

    const createReward = async (userCredentials) => {
        let date = new Date();
        // if (date.getTime() >= streamTimestamp - 900000) {
            let rewardsIdsObject = {};
            const expReward = await createCustomReward(user.uid, user.id, userCredentials.access_token, userCredentials.refresh_token, 'XQ Qapla', 500, true, handleTwitchSignIn, false, 0, true, 1);
            const qoinsReward = await createCustomReward(user.uid, user.id, userCredentials.access_token, userCredentials.refresh_token, 'Qoins Qapla', 500, false, handleTwitchSignIn, true, user.subscriptionDetails.redemptionsPerStream || 35, true, 1);

            if (!expReward || !qoinsReward) {
                return await handleDuplicatedCustomReward();
            }

            rewardsIdsObject = { expReward: expReward.id, qoinsReward: qoinsReward.id };

            if (Object.keys(rewardsIdsObject).length === 2) {
                setRewardsIds({ expReward: expReward.id, qoinsReward: qoinsReward.id });
                await saveStreamerTwitchCustomReward(user.uid, 'expReward', expReward.id, expReward.title, expReward.cost, streamId);
                await saveStreamerTwitchCustomReward(user.uid, 'qoinsReward', qoinsReward.id, qoinsReward.title, qoinsReward.cost, streamId);
                alert(t('handleStream.rewardsCreated'));
            }

            return rewardsIdsObject;
        /* } else {
            alert('La conexion solo puede realizarse cuando mucho 15 minutos antes de la hora en que esta programado el evento');
        } */

        return null;
    }

    const handleDuplicatedCustomReward = async () => {
        alert(t('handleStream.streamerHasAnOpenStream'));
        const activeRewards = await getOpenCustomRewards(user.uid);
        let rewardsIdsToDelete = {};
        let streamIdToClose;
        activeRewards.forEach((activeReward) => {
            rewardsIdsToDelete.expReward = activeReward.val().expReward.rewardId;
            rewardsIdsToDelete.qoinsReward = activeReward.val().qoinsReward.rewardId;
            streamIdToClose = activeReward.key;
        });

        if (rewardsIdsToDelete.expReward && rewardsIdsToDelete.qoinsReward && streamIdToClose) {
            const userCredentialsUpdated = await handleTwitchSignIn();

            await finishStream(streamIdToClose, rewardsIdsToDelete);

            return await createReward(userCredentialsUpdated);
        } else {
            alert('Las recompensas existentes no han podido ser eliminadas, contacta con soporte técnico.');
        }
    }

    const deleteReward = async (rewardIdToDelete, userCredentials) => {
        const result = await deleteCustomReward(user.uid, user.id, userCredentials.access_token, userCredentials.refresh_token, rewardIdToDelete, handleTwitchSignIn);

        console.log(result);

        if (result === 204) {
            alert('Recompensa eliminada correctamente');
        } else if (result === 404 || result === 403) {
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

        // Give rewards to Qapla users that were not registered to the event
        await handleFailedRewardRedemptions(streamIdToClose, rewardsIdsToDelete, userCredentialsUpdated);

        // Remove the custom reward from the ActiveCustomReward node on the database
        await removeActiveCustomRewardFromList(streamIdToClose);

        const rewardsIdToDeleteArray = Object.keys(rewardsIdsToDelete).map((reward) => rewardsIdsToDelete[reward]);

        // Just then remove the reward. This line can not never be before the handleFailedRewardRedemptions
        for (let i = 0; i < rewardsIdToDeleteArray.length; i++) {
            await deleteReward(rewardsIdToDeleteArray[i], userCredentialsUpdated);
        }

        // Mark as closed the stream on the database
        await markAsClosedStreamerTwitchCustomReward(user.uid, streamIdToClose);

        setRewardsIds({});

        setVerifyngRedemptions(false);
        setConnectedToTwitch(false);

        alert(t('handleStream.rewardsSent'));
    }

    const handleFailedRewardRedemptions = async (streamIdToAssignRewards, rewardsIdsToDelete, userCredentials) => {
        setStreamInRedemptionsLists(streamId);
        const expRedemptions = await getAllRewardRedemptions(user.uid, user.id, userCredentials.access_token, userCredentials.refresh_token, rewardsIdsToDelete.expReward, handleTwitchSignIn);
        let usersPrizes = {};
        for (let i = 0; i < expRedemptions.length; i++) {
            const redemption = expRedemptions[i];
            const qaplaUser = await getUserByTwitchId(redemption.user_id);
            if (qaplaUser) {
                const userRedemptionsOnDatabase = await getStreamUserRedemptions(qaplaUser.id, streamIdToAssignRewards);
                usersPrizes[redemption.user_id] = {
                    twitchUserName: redemption.user_name,
                    redemptionId: redemption.id,
                    rewardId: redemption.reward.id,
                    status: redemption.status,
                    timestamp: redemption.redeemed_at,
                    uid: qaplaUser.id,
                    qaplaLevel: qaplaUser.qaplaLevel,
                    userName: qaplaUser.userName,
                    photoUrl: qaplaUser.photoUrl,
                    redemptions: userRedemptionsOnDatabase.exists() ? userRedemptionsOnDatabase.val() : null
                };
            }
        }

        addListToStreamRedemptionList(streamId, 'XQReward', expRedemptions);

        let usersPrizeArray = Object.keys(usersPrizes).map((twitchId) => ({ ...usersPrizes[twitchId], twitchId }));

        for (let i = 0; i < usersPrizeArray.length; i++) {
            const twitchUser = usersPrizeArray[i];
            let giveXQToUser = true;

            // If the user has no redemptions on our database but is in the list it means it actually has redeemed the reward with Twitch
            if (twitchUser.redemptions) {
                // If the user has redemptions on our database but has no redemptions of XQ type set giveXQToUser to true
                giveXQToUser = !Object.keys(twitchUser.redemptions).some((redemptionId) => twitchUser.redemptions[redemptionId].type === XQ);
            }

            if (giveXQToUser) {
                await saveCustomRewardRedemption(twitchUser.uid, twitchUser.photoUrl, twitchUser.twitchId, twitchUser.twitchUserName, streamIdToAssignRewards, XQ, twitchUser.redemptionId, twitchUser.rewardId, twitchUser.status);

                const expToGive = 15;
                giveStreamExperienceForRewardRedeemed(twitchUser.uid, twitchUser.qaplaLevel, twitchUser.userName, expToGive);
                addInfoToEventParticipants(streamIdToAssignRewards, twitchUser.uid, 'xqRedeemed', expToGive);
                saveUserStreamReward(twitchUser.uid, XQ, user.displayName, streamIdToAssignRewards, expToGive);

                const userHasRedeemedQoins = twitchUser.redemptions ? Object.keys(twitchUser.redemptions).some((redemptionId) => twitchUser.redemptions[redemptionId].type === QOINS) : false;

                if (userHasRedeemedQoins) {
                    let qoinsToGive = 5;

                    addQoinsToUser(twitchUser.uid, qoinsToGive);
                    addInfoToEventParticipants(streamIdToAssignRewards, twitchUser.uid, 'qoinsRedeemed', qoinsToGive * 2);
                    saveUserStreamReward(twitchUser.uid, QOINS, user.displayName, streamIdToAssignRewards, qoinsToGive);
                }
            }
        }

        let redemptionCounter = (await getStreamRedemptionCounter(streamId)).val();

        const redemptionsAllowedPerStream = user.subscriptionDetails.redemptionsPerStream || 35;

        /**
         * If the counter does not exists or if exists but the value is less than the maximum value allowed
         * we get the list and distribute the Qoins to the users
         */
        if (!redemptionCounter || (redemptionCounter && redemptionCounter < redemptionsAllowedPerStream)) {
            const qoinsRedemptions = await getAllRewardRedemptions(user.uid, user.id, userCredentials.access_token, userCredentials.refresh_token, rewardsIdsToDelete.qoinsReward, handleTwitchSignIn);
            usersPrizes = {};
            for (let i = 0; i < qoinsRedemptions.length; i++) {
                const redemption = qoinsRedemptions[i];
                const qaplaUser = await getUserByTwitchId(redemption.user_id);
                if (qaplaUser) {
                    const userRedemptionsOnDatabase = await getStreamUserRedemptions(qaplaUser.id, streamIdToAssignRewards);
                    usersPrizes[redemption.user_id] = {
                        twitchUserName: redemption.user_name,
                        redemptionId: redemption.id,
                        rewardId: redemption.reward.id,
                        status: redemption.status,
                        timestamp: redemption.redeemed_at,
                        uid: qaplaUser.id,
                        qaplaLevel: qaplaUser.qaplaLevel,
                        userName: qaplaUser.userName,
                        photoUrl: qaplaUser.photoUrl,
                        redemptions: userRedemptionsOnDatabase.exists() ? userRedemptionsOnDatabase.val() : null
                    };
                }
            }

            addListToStreamRedemptionList(streamId, 'QoinsReward', qoinsRedemptions);

            usersPrizeArray = Object.keys(usersPrizes).map((twitchId) => ({ ...usersPrizes[twitchId], twitchId }));

            for (let i = 0; i < usersPrizeArray.length; i++) {
                if (redemptionCounter < redemptionsAllowedPerStream) {
                    const twitchUser = usersPrizeArray[i];
                    let giveQoinsToUser = true;

                    // If the user has no redemptions on our database but is in the list it means it actually has redeemed the reward with Twitch
                    if (twitchUser.redemptions) {
                        // If the user has redemptions on our database but has no redemptions of QOINS type set giveQoinsToUser to true
                        giveQoinsToUser = !Object.keys(twitchUser.redemptions).some((redemptionId) => twitchUser.redemptions[redemptionId].type === QOINS);
                    }

                    if (giveQoinsToUser) {
                        await saveCustomRewardRedemption(twitchUser.uid, twitchUser.photoUrl, twitchUser.twitchId, twitchUser.userName, streamIdToAssignRewards, QOINS, twitchUser.redemptionId, twitchUser.rewardId, twitchUser.status);

                        let qoinsToGive = 5;

                        const userHasRedeemedExperience = twitchUser.redemptions ? Object.keys(twitchUser.redemptions).some((redemptionId) => twitchUser.redemptions[redemptionId].type === XQ) : false;

                        // If the user has redeemed both XQ and Qoins rewards
                        if (userHasRedeemedExperience) {
                            // Give him 10 qoins instead of 5
                            qoinsToGive = 10;
                        }

                        addQoinsToUser(twitchUser.uid, qoinsToGive);
                        addInfoToEventParticipants(streamIdToAssignRewards, twitchUser.uid, 'qoinsRedeemed', qoinsToGive);
                        saveUserStreamReward(twitchUser.uid, QOINS, user.displayName, streamIdToAssignRewards, qoinsToGive);
                    }

                    redemptionCounter++;
                } else {
                    return;
                }
            }
        }
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
        </StreamerDashboardContainer>
    );
}

export default PubSubTest;
