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
    getCustomRewardRedemptions,
    setStreamInRedemptionsLists,
    addListToStreamRedemptionList
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
    const [connectedToTwitch, setConnectedToTwitch] = useState(false);
    const [verifyngRedemptions, setVerifyngRedemptions] = useState(false);
    const [rewardsIds, setRewardsIds] = useState({});
    const [isQoinsRewardEnabled, setIsQoinsRewardEnabled] = useState(false);
    const [oldUser, setOldUser] = useState({ twitchAccessToken: '' });
    const [streamTimestamp, setStreamTimestamp] = useState(0);
    const [usersThatRedeemed, setUsersThatRedeemed] = useState({});

    useEffect(() => {
        async function getTimestamp() {
            if (streamId) {
                const timestamp = await getStreamTimestamp(streamId);
                if (timestamp.exists()) {
                    setStreamTimestamp(timestamp.val());
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

        getTimestamp();
    }, [streamId, user, rewardsIds, oldUser, streamTimestamp]);

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
                alert('Este evento ya fue cerrado, si es necesario reabrirlo contacta con soporte tecnico');
            }
        } else {
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
            const expReward = await createCustomReward(user.uid, user.id, user.twitchAccessToken, user.refreshToken, 'expReward', 'XQ Qapla', 500, true, handleTwitchSignIn, streamId);
            const qoinsReward = await createCustomReward(user.uid, user.id, user.twitchAccessToken, user.refreshToken, 'qoinsReward', 'Qoins Qapla', 500, false, handleTwitchSignIn, streamId, true, 75);

            if (!expReward || !qoinsReward) {
                return await handleDuplicatedCustomReward();
            }

            rewardsIdsObject = { expReward: expReward.id, qoinsReward: qoinsReward.id };

            if (Object.keys(rewardsIdsObject).length === 2) {
                alert('Recompensas creadas, manten esta ventana abierta');
                setRewardsIds({ expReward: expReward.id, qoinsReward: qoinsReward.id });
            }

            return (Object.keys(rewardsIdsObject).length === 2) ? { expReward, qoinsReward } : {};
        } else {
            alert('La conexion solo puede realizarse cuando mucho 15 minutos antes de la hora en que esta programado el evento');
        }

        return null;
    }

    const handleDuplicatedCustomReward = async () => {
        alert('Existen recompensas activas, se eliminaran y se crearan nuevas para continuar');
        const activeRewards = await getOpenCustomRewards(user.uid);
        let rewardsIdsToDelete = {};
        let streamIdToClose;
        activeRewards.forEach((activeReward) => {
            rewardsIdsToDelete.expReward = activeReward.val().expReward.rewardId;
            rewardsIdsToDelete.qoinsReward = activeReward.val().qoinsReward.rewardId;
            streamIdToClose = activeReward.key;
        });

        await markAsClosedStreamerTwitchCustomReward(user.uid, streamIdToClose);

        await finishStream(streamIdToClose, rewardsIdsToDelete);
        return await createReward();
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
        if (window.confirm('¿Estas seguro de que deseas desconectar tu stream?')) {
            closeConnection();
            // Mark as closed the stream on the database
            await markAsClosedStreamerTwitchCustomReward(user.uid, streamId);

            finishStream(streamId, rewardsIds);
        }
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

        setVerifyngRedemptions(false);
        setConnectedToTwitch(false);
    }

    const handleFailedRewardRedemptions = async (streamIdToAssignRewards, rewardsIdsToDelete) => {
        setStreamInRedemptionsLists(streamId);
        const usersThatRedeemedCopy = {...usersThatRedeemed};
        const expRedemptions = await getAllRewardRedemptions(user.uid, user.id, user.twitchAccessToken, user.refreshToken, rewardsIdsToDelete.expReward, handleTwitchSignIn);
        let usersPrizes = {};
        for (let i = 0; i < expRedemptions.length; i++) {
            const redemption = expRedemptions[i];
            if (!usersThatRedeemedCopy[redemption.user_id]) {
                usersPrizes[redemption.user_id] = { userName: redemption.user_name, redemptionId: redemption.id, rewardId: redemption.reward.id, status: redemption.status, timestamp: redemption.redeemed_at };
            }
        }

        addListToStreamRedemptionList(streamId, 'XQReward', expRedemptions);

        let usersPrizeArray = Object.keys(usersPrizes).map((twitchId) => ({ ...usersPrizes[twitchId], twitchId }));

        for (let i = 0; i < usersPrizeArray.length; i++) {
            const twitchUser = usersPrizeArray[i];
            const qaplaUser = await getUserByTwitchId(twitchUser.twitchId);
            if (qaplaUser) {
                await saveCustomRewardRedemption(qaplaUser.id, qaplaUser.photoUrl, twitchUser.twitchId, twitchUser.userName, streamIdToAssignRewards, XQ, twitchUser.redemptionId, twitchUser.rewardId, twitchUser.status);

                const expToGive = 15;
                giveStreamExperienceForRewardRedeemed(qaplaUser.id, qaplaUser.qaplaLevel, qaplaUser.userName, expToGive);
                addInfoToEventParticipants(streamIdToAssignRewards, qaplaUser.id, 'xqRedeemed', expToGive);
                saveUserStreamReward(qaplaUser.id, XQ, user.displayName, streamIdToAssignRewards, expToGive);
            } else {
                console.log(twitchUser.userName + ' No Qapla user');
            }
        }

        const qoinsRedemptions = await getAllRewardRedemptions(user.uid, user.id, user.twitchAccessToken, user.refreshToken, rewardsIdsToDelete.qoinsReward, handleTwitchSignIn);
        usersPrizes = {};
        for (let i = 0; i < qoinsRedemptions.length; i++) {
            const redemption = qoinsRedemptions[i];
            if (!usersThatRedeemedCopy[redemption.user_id]) {
                usersPrizes[redemption.user_id] = { userName: redemption.user_name, redemptionId: redemption.id, rewardId: redemption.reward.id, status: redemption.status, timestamp: redemption.redeemed_at };
            }
        }

        addListToStreamRedemptionList(streamId, 'QoinsReward', qoinsRedemptions);

        usersPrizeArray = Object.keys(usersPrizes).map((twitchId) => ({ ...usersPrizes[twitchId], twitchId }));

        for (let i = 0; i < usersPrizeArray.length; i++) {
            const twitchUser = usersPrizeArray[i];
            const qaplaUser = await getUserByTwitchId(twitchUser.twitchId);
            if (qaplaUser) {
                await saveCustomRewardRedemption(qaplaUser.id, qaplaUser.photoUrl, twitchUser.twitchId, twitchUser.userName, streamIdToAssignRewards, QOINS, twitchUser.redemptionId, twitchUser.rewardId, twitchUser.status);

                const userHasRedeemedExperience = await getCustomRewardRedemptions(streamIdToAssignRewards, qaplaUser.id);

                console.log(userHasRedeemedExperience.val());
                console.log(Object.keys(userHasRedeemedExperience.val()).length);

                let qoinsToGive = 5;

                // If the user has already redeemed the exp reward and now the qoins reward
                if (userHasRedeemedExperience.exists() && Object.keys(userHasRedeemedExperience.val()).length === 2) {
                    // Give him 10 qoins instead of 5
                    qoinsToGive = 10;
                }

                addQoinsToUser(qaplaUser.id, qoinsToGive);
                addInfoToEventParticipants(streamIdToAssignRewards, qaplaUser.id, 'qoinsRedeemed', qoinsToGive);
                saveUserStreamReward(qaplaUser.id, QOINS, user.displayName, streamIdToAssignRewards, qoinsToGive);
            } else {
                console.log(twitchUser.userName + ' No Qapla user');
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
                <Grid xs={4} container>
                    <Grid xs={6}>
                        <ContainedButton onClick={!connectedToTwitch ? listenForRewards : unlistenForRewards}
                            disabled={verifyngRedemptions}
                            endIcon={verifyngRedemptions ? <CircularProgress style={{ color: '#FFF' }} /> : null}>
                            {verifyngRedemptions ?
                                'Desconectando, espere porfavor...'
                            :
                                !connectedToTwitch ? 'Conectar a Twitch' : 'Desconectar de twitch'
                            }
                        </ContainedButton>
                        {(connectedToTwitch && !isQoinsRewardEnabled) &&
                            <ContainedButton onClick={enableQoinsReward}>
                                Habilitar recompensa de Qoins
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
