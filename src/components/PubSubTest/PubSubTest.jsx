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
    Avatar
} from '@material-ui/core';

import { ReactComponent as ProfileIcon } from './../../assets/ProfileIcon.svg';

import { connect, createCustomReward, deleteCustomReward, closeConnection } from '../../services/twitch';
import { signInWithTwitch } from '../../services/auth';
import ContainedButton from '../ContainedButton/ContainedButton';
import { updateStreamerProfile, listenCustomRewardRedemptions, getStreamTimestamp, saveUserStreamReward } from '../../services/database';
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
    const [rewardId, setRewardId] = useState('');
    const [streamTimestamp, setStreamTimestamp] = useState(0);
    const [userThatRedeemed, setUserThatRedeemed] = useState({});

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

                setUserThatRedeemed(usersToSave);
            }
        });

        getTimestamp();
    }, [streamId]);

    const listenForRewards = async () => {
        const reward = await createReward();
        if (reward) {
            connect(streamId, user.uid, user.twitchAccessToken, [`channel-points-channel-v1.${user.id}`], reward.id, streamTimestamp, handleTwitchSignIn);
            setConnectedToTwitch(true);
        } else {
            alert('Qapla Custom Reward couldn´t been created');
        }
    }

    const createReward = async () => {
        let date = new Date();
        if (date.getTime() >= streamTimestamp - 900000) {
            const reward = await createCustomReward(user.uid, user.id, user.twitchAccessToken, 'Qapla', 500, handleTwitchSignIn);

            if (reward) {
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

    const handleTwitchSignIn = async (callback) => {
        const user = await signInWithTwitch();
        await updateStreamerProfile(user.firebaseAuthUser.user.uid, user.userData);
        callback(user.userData.twitchAccessToken);
    }

    const unlistenForRewards = async () => {
        //await deleteReward();
        closeConnection();
        setConnectedToTwitch(false);
    }

    return (
        <StreamerDashboardContainer user={{ id: 'algo' }}>
            <Grid container>
                <Grid xs={3}>
                    <ContainedButton onClick={!connectedToTwitch ? listenForRewards : unlistenForRewards}>
                        {!connectedToTwitch ? 'Conectar a Twitch' : 'Desconectar de twitch'}
                    </ContainedButton>
                </Grid>
                {Object.keys(userThatRedeemed).length > 0 &&
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
                                    {Object.keys(userThatRedeemed).map((uid, index) => (
                                        <TableRow className={index % 2 === 0 ? classes.tableRow : classes.tableRowOdd}
                                            key={`Participant-${uid}`}>
                                            <TableCellStyled align='center' className={classes.firstCell}>
                                                <Avatar
                                                    className={classes.avatar}
                                                    src={userThatRedeemed[uid].photoUrl} />
                                            </TableCellStyled>
                                            <TableCellStyled>
                                                {userThatRedeemed[uid].displayName}
                                            </TableCellStyled>
                                            <TableCellStyled className={classes.lastCell}>
                                                {userThatRedeemed[uid].numberOfRedemptions}
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
