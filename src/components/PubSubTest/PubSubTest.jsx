import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
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
    getStreamUserRedemptions
} from '../../services/database';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import { XQ, QOINS } from '../../utilities/Constants';



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
            connect(streamId, user.displayName, user.uid, user.twitchAccessToken, user.refreshToken, [`channel-points-channel-v1.${user.id}`], rewardsIds, streamTimestamp, handleTwitchSignIn);
            setOldUser(user);
        }

        checkIfStreamIsAlreadyOpen();
        getTimestamp();
    }, [streamId, connectedToTwitch, user, rewardsIds, oldUser, streamTimestamp]);

    const listenForRewards = async () => {

        const rewardOnDatabase = await getStreamCustomReward(user.uid, streamId);

        if (rewardOnDatabase.exists()){
            if (!rewardOnDatabase.val().closedStream) {
                let rewards = { expReward: rewardOnDatabase.val().expReward.rewardId, qoinsReward: rewardOnDatabase.val().qoinsReward.rewardId }
                setRewardsIds(rewards);

                connect(streamId, user.displayName, user.uid, user.twitchAccessToken, user.refreshToken, [`channel-points-channel-v1.${user.id}`], rewards, streamTimestamp, handleTwitchSignIn);
                setOldUser(user);
                setConnectedToTwitch(true);
                alert('Reconectado con exito');
            } else {
                alert(t('handleStream.streamClosed'));
            }
        } else {
            alert('Conectando');
            const reward = await createReward();

            if (reward) {
                connect(streamId, user.displayName, user.uid, user.twitchAccessToken, user.refreshToken, [`channel-points-channel-v1.${user.id}`], reward.id, streamTimestamp, handleTwitchSignIn);
                setOldUser(user);
                setConnectedToTwitch(true);
            } else {
                alert('Qapla Custom Reward couldn´t been created');
            }
        }
    }

    const createReward = async () => {
        let date = new Date();
        if (date.getTime() >= streamTimestamp - 900000) {
            let rewardsIdsObject = {};
            const expReward = await createCustomReward(user.uid, user.id, user.twitchAccessToken, user.refreshToken, 'XQ Qapla', 500, true, handleTwitchSignIn, streamId);
            const qoinsReward = await createCustomReward(user.uid, user.id, user.twitchAccessToken, user.refreshToken, 'Qoins Qapla', 500, false, handleTwitchSignIn, streamId, true, 75);

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

            return (Object.keys(rewardsIdsObject).length === 2) ? { expReward, qoinsReward } : {};
        } else {
            alert('La conexion solo puede realizarse cuando mucho 15 minutos antes de la hora en que esta programado el evento');
        }

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
            await markAsClosedStreamerTwitchCustomReward(user.uid, streamIdToClose);

            return await createReward();
        } else {
            alert('Las recompensas existentes no han podido ser eliminadas, contacta con soporte técnico.');
        }
    }

    const deleteReward = async (rewardIdToDelete) => {
        console.log('Delete reward');
        const result = await deleteCustomReward(user.uid, user.id, user.twitchAccessToken, user.refreshToken, rewardIdToDelete, handleTwitchSignIn);

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

        // Give rewards to Qapla users that were not registered to the event
        await handleFailedRewardRedemptions(streamIdToClose, rewardsIdsToDelete);

        // Remove the custom reward from the ActiveCustomReward node on the database
        await removeActiveCustomRewardFromList(streamIdToClose);

        const rewardsIdToDeleteArray = Object.keys(rewardsIdsToDelete).map((reward) => rewardsIdsToDelete[reward]);

        // Just then remove the reward. This line can not never be before the handleFailedRewardRedemptions
        for (let i = 0; i < rewardsIdToDeleteArray.length; i++) {
            await deleteReward(rewardsIdToDeleteArray[i]);
        }

        // Mark as closed the stream on the database
        await markAsClosedStreamerTwitchCustomReward(user.uid, streamId);

        setRewardsIds({});

        setVerifyngRedemptions(false);
        setConnectedToTwitch(false);

        alert(t('handleStream.rewardsSent'));
    }

    const handleFailedRewardRedemptions = async (streamIdToAssignRewards, rewardsIdsToDelete) => {
        setStreamInRedemptionsLists(streamId);
        const expRedemptions = await getAllRewardRedemptions(user.uid, user.id, user.twitchAccessToken, user.refreshToken, rewardsIdsToDelete.expReward, handleTwitchSignIn);
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

        const qoinsRedemptions = await getAllRewardRedemptions(user.uid, user.id, user.twitchAccessToken, user.refreshToken, rewardsIdsToDelete.qoinsReward, handleTwitchSignIn);
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
        }
    }

    const enableQoinsReward = async () => {
        if (await enableCustomReward(user.uid, user.id, user.twitchAccessToken, user.refreshToken, rewardsIds.qoinsReward, handleTwitchSignIn) === 200) {
            setIsQoinsRewardEnabled(true);
        }
    }

    const rewardsAreCreated = () => Object.keys(rewardsIds).length === 2;

    return (
        <StreamerDashboardContainer user={user}>
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
