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

import { connect, createCustomReward, deleteCustomReward, closeConnection, getAllRewardRedemptions } from '../../services/twitch';
import { signInWithTwitch } from '../../services/auth';
import ContainedButton from '../ContainedButton/ContainedButton';
import {
    updateStreamerProfile,
    listenCustomRewardRedemptions,
    getStreamTimestamp,
    getStreamCustomReward,
    getCustomRewardId,
    getUserByTwitchId,
    addQoinsToUser,
    addInfoToEventParticipants,
    saveUserStreamReward,
    giveStreamExperienceForRewardRedeemed,
    saveCustomRewardRedemption,
    markAsClosedStreamerTwitchCustomReward
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
    const [rewardId, setRewardId] = useState('');
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

        if (rewardId && user.twitchAccessToken !== oldUser.twitchAccessToken) {
            connect(streamId, user.displayName, user.uid, user.twitchAccessToken, user.refreshToken, [`channel-points-channel-v1.${user.id}`], rewardId, streamTimestamp, handleTwitchSignIn);
            setOldUser(user);
        }

        getTimestamp();
    }, [streamId, user, rewardId, oldUser, streamTimestamp]);

    const listenForRewards = async () => {

        const rewardOnDatabase = await getStreamCustomReward(user.uid, streamId);

        if (rewardOnDatabase.exists()){
            if (!rewardOnDatabase.val().closedStream) {
                const customRewardId = rewardOnDatabase.val().rewardId;
                setRewardId(customRewardId);

                connect(streamId, user.displayName, user.uid, user.twitchAccessToken, user.refreshToken, [`channel-points-channel-v1.${user.id}`], customRewardId, streamTimestamp, handleTwitchSignIn);
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
            const reward = await createCustomReward(user.uid, user.id, user.twitchAccessToken, user.refreshToken, 'Qapla', 500, handleTwitchSignIn, streamId);

            if (reward) {
                alert('La recompensa fue creada, manten esta ventana abierta');
                setRewardId(reward.id);
            }

            return reward ? reward : null;
        } else {
            alert('La conexion solo puede realizarse cuando mucho 15 minutos antes de la hora en que esta programado el evento');
        }

        return null;
    }

    const deleteReward = async () => {
        console.log('Delete reward');
        const result = await deleteCustomReward(user.uid, user.id, user.twitchAccessToken, rewardId, handleTwitchSignIn);

        console.log(result);

        if (result === 204) {
            alert('Elemento eliminado correctamente');
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
            //await deleteReward();
            closeConnection();
            setVerifyngRedemptions(true);
            await handleFailedRewardRedemptions();
            await markAsClosedStreamerTwitchCustomReward(user.uid, streamId);
            setVerifyngRedemptions(false);
            setConnectedToTwitch(false);
        }
    }

    const handleFailedRewardRedemptions = async () => {
        const usersThatRedeemedCopy = {...usersThatRedeemed};
        const redemptions = await getAllRewardRedemptions(user.uid, user.id, user.twitchAccessToken, user.refreshToken, rewardId, handleTwitchSignIn);
        const usersPrizes = {};
        for (let i = 0; i < redemptions.length; i++) {
            const redemption = redemptions[i];
            if (!usersThatRedeemedCopy[redemption.user_id]) {
                if (usersPrizes[redemption.user_id] && usersPrizes[redemption.user_id].redemptions) {
                    usersPrizes[redemption.user_id].redemptions = 2;
                    usersPrizes[redemption.user_id].redemptionsIds.push(redemption.id);
                } else {
                    usersPrizes[redemption.user_id] = { redemptions: 1, userName: redemption.user_name, redemptionsIds: [redemption.id], rewardId: redemption.reward.id, status: redemption.status } ;
                }
            }
        }

        const usersPrizeArray = Object.keys(usersPrizes).map((twitchId) => ({ ...usersPrizes[twitchId], twitchId }));

        for (let i = 0; i < usersPrizeArray.length; i++) {
            const twitchUser = usersPrizeArray[i];
            const qaplaUser = await getUserByTwitchId(twitchUser.twitchId);
            if (qaplaUser) {
                await saveCustomRewardRedemption(qaplaUser.id, qaplaUser.photoUrl, twitchUser.twitchId, twitchUser.userName, streamId, twitchUser.redemptionsIds[0], twitchUser.rewardId, twitchUser.status);
                giveStreamExperienceForRewardRedeemed(qaplaUser.id, qaplaUser.qaplaLevel, qaplaUser.userName, 15);
                addInfoToEventParticipants(streamId, qaplaUser.id, 'xqRedeemed', 15);
                saveUserStreamReward(qaplaUser.id, XQ, user.displayName, streamId, 15);

                if (twitchUser.redemptions === 2) {
                    await saveCustomRewardRedemption(qaplaUser.id, qaplaUser.photoUrl, twitchUser.twitchId, twitchUser.userName, streamId, twitchUser.redemptionsIds[1], twitchUser.rewardId, twitchUser.status);
                    addQoinsToUser(qaplaUser.id, 10);
                    addInfoToEventParticipants(streamId, qaplaUser.id, 'qoinsRedeemed', 10);
                    saveUserStreamReward(qaplaUser.id, QOINS, user.displayName, streamId, 10);
                }
            } else {
                console.log(twitchUser.userName + ' No Qapla user');
            }
        }
    }

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
