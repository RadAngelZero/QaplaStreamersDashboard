import React, { useState } from 'react';
import { makeStyles, Container, FormControlLabel, Checkbox, Button, InputAdornment, InputLabel, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';

import { signInWithTwitch } from '../../services/auth';
import { updateStreamerProfile } from '../../services/database';
import { createCustomReward, deleteCustomReward, disableCustomReward, enableCustomReward, getAllRewardRedemptions } from '../../services/twitch';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CheckedIcon } from './../../assets/CheckedIcon.svg';
import { ReactComponent as UncheckedIcon } from './../../assets/UncheckedIcon.svg';
import ContainedButton from '../ContainedButton/ContainedButton';

const useStyles = makeStyles((theme) => ({
    label: {
        color: '#FFF',
        fontSize: '14px'
    }
}));

const Lottery = ({ user }) => {
    const [lotteryTitle, setLotteryTitle] = useState('Sorteo Qapla (TEST)');
    const [lotteryCost, setLotteryCost] = useState(0);
    const [enabledLottery, setEnabledLottery] = useState(true);
    const [isMaxPerStreamEnabled, setIsMaxPerStreamEnabled] = useState(false);
    const [maxPerStream, setMaxPerStream] = useState(1);
    const [isMaxPerUserPerStreamEnabled, setIsMaxPerUserPerStreamEnabled] = useState(false);
    const [maxPerUserPerStream, setMaxPerUserPerStream] = useState(1);
    const [rewardId, setRewardId] = useState('');
    const [helpMessage, setHelpMessage] = useState('');

    const classes = useStyles();

    const createLotteryReward = async () => {
        const userCredentialsUpdated = { access_token: user.twitchAccessToken, refresh_token: user.refreshToken }; //await handleTwitchSignIn();
        const reward = await createCustomReward(
            user.uid,
            user.id,
            userCredentialsUpdated.access_token,
            userCredentialsUpdated.refresh_token,
            lotteryTitle,
            lotteryCost,
            enabledLottery,
            handleTwitchSignIn,
            isMaxPerStreamEnabled,
            maxPerStream,
            isMaxPerUserPerStreamEnabled,
            maxPerUserPerStream
        );

        if (reward) {
            setRewardId(reward.id);
        } else {
            alert('La recompensa no pudo ser creada');
        }
    }

    const handleTwitchSignIn = async () => {
        let user = await signInWithTwitch();
        await updateStreamerProfile(user.firebaseAuthUser.user.uid, user.userData);

        user.access_token = user.userData.twitchAccessToken;
        user.refresh_token = user.userData.refreshToken;
        return user;
    }

    const disableReward = async () => {
        const userCredentialsUpdated = { access_token: user.twitchAccessToken, refresh_token: user.refreshToken }; //await handleTwitchSignIn();
        const status = await disableCustomReward(
            user.uid,
            user.id,
            userCredentialsUpdated.access_token,
            userCredentialsUpdated.refresh_token,
            rewardId,
            handleTwitchSignIn
        );

        if (status === 200) {
            setEnabledLottery(false);
            alert('Recompensa deshabilitada');
        } else {
            alert('Hubo problemas al deshabilitar la recompensa, contacta con soporte tecnico');
        }
    }

    const enableReward = async () => {
        const userCredentialsUpdated = { access_token: user.twitchAccessToken, refresh_token: user.refreshToken }; //await handleTwitchSignIn();
        const status = await enableCustomReward(
            user.uid,
            user.id,
            userCredentialsUpdated.access_token,
            userCredentialsUpdated.refresh_token,
            rewardId,
            handleTwitchSignIn
        );

        if (status === 200) {
            setEnabledLottery(true);
            alert('Recompensa habilitada');
        } else {
            alert('Hubo problemas al habilitar la recompensa, contacta con soporte tecnico');
        }
    }

    const pickRandomUserFromList = async () => {
        const userCredentialsUpdated = { access_token: user.twitchAccessToken, refresh_token: user.refreshToken }; //await handleTwitchSignIn();
        setHelpMessage('Obteniendo lista');
        const userList = await getAllRewardRedemptions(
            user.uid,
            user.id,
            userCredentialsUpdated.access_token,
            userCredentialsUpdated.refresh_token,
            rewardId,
            handleTwitchSignIn
        );

        if (userList.length > 0) {
            setTimeout(() => {
                setHelpMessage('Buscando al ganador...');
                const randomIndex = Math.floor(Math.random() * userList.length);
                console.log(randomIndex);
                console.log(userList);
                console.log(userList[randomIndex]);
                setTimeout(() => {
                    console.log(userList[randomIndex]);
                    setHelpMessage(`El ganador es:  ${userList[randomIndex].user_name}`);
                }, 2000);
            }, 1500);
        } else {
            setHelpMessage('Nadie ha canjeado la recompensa aun');
        }
    }

    const finishLottery = async () => {
        const userCredentialsUpdated = { access_token: user.twitchAccessToken, refresh_token: user.refreshToken }; //await handleTwitchSignIn();

        setHelpMessage('Terminando sorteo');
        await deleteCustomReward(user.uid, user.id, userCredentialsUpdated.access_token, userCredentialsUpdated.refresh_token, rewardId, handleTwitchSignIn);
        setRewardId('');
        setHelpMessage('Recompensa eliminada correctamente');
    }

    return (
        <Container>
            <br /><br /><br />
            {!rewardId ?
                <>
                    <StreamerTextInput label='Nombre de la recompensa'
                        value={lotteryTitle}
                        onChange={(e) => setLotteryTitle(e.target.value)} />
                    <StreamerTextInput label='Costo de la recompensa'
                        type='number'
                        value={lotteryCost}
                        onChange={(e) => setLotteryCost(e.target.value)} />
                    <FormControlLabel
                        checked={enabledLottery}
                        onChange={(e) => setEnabledLottery(e.target.checked)}
                        classes={{ label: classes.label }}
                        control={
                            <Checkbox defaultChecked
                                checkedIcon={<CheckedIcon />}
                                icon={<UncheckedIcon />}
                                style={{ backgroundColor: 'transparent' }} />
                        }
                        label='Hacer visible al crear' />
                    <br />
                    <FormControlLabel
                        checked={isMaxPerStreamEnabled}
                        onChange={(e) => setIsMaxPerStreamEnabled(e.target.checked)}
                        classes={{ label: classes.label }}
                        control={
                            <Checkbox defaultChecked
                                checkedIcon={<CheckedIcon />}
                                icon={<UncheckedIcon />}
                                style={{ backgroundColor: 'transparent' }} />
                        }
                        label='Limite por stream' />
                    <StreamerTextInput label='Maximo por stream'
                        disabled={!isMaxPerStreamEnabled}
                        value={isMaxPerStreamEnabled ? maxPerStream : 'Ilimitado'}
                        onChange={(e) => setMaxPerStream(e.target.value)} />
                    <FormControlLabel
                        checked={isMaxPerUserPerStreamEnabled}
                        onChange={(e) => setIsMaxPerUserPerStreamEnabled(e.target.checked)}
                        classes={{ label: classes.label }}
                        control={
                            <Checkbox defaultChecked
                                checkedIcon={<CheckedIcon />}
                                icon={<UncheckedIcon />}
                                style={{ backgroundColor: 'transparent' }} />
                        }
                        label='Limite por usuario por stream' />
                    <StreamerTextInput label='Maximo por usuario por stream'
                        disabled={!isMaxPerUserPerStreamEnabled}
                        value={isMaxPerUserPerStreamEnabled ? maxPerUserPerStream : 'Ilimitado'}
                        onChange={(e) => setMaxPerUserPerStream(e.target.value)} />
                    <br />
                    <ContainedButton onClick={createLotteryReward}>
                        Crear recompensa
                    </ContainedButton>
                </>
                :
                <>
                    {enabledLottery ?
                        <ContainedButton onClick={disableReward}>
                            Deshabilitar recompensa
                        </ContainedButton>
                        :
                        <ContainedButton onClick={enableReward}>
                            Habilitar recompensa
                        </ContainedButton>
                    }
                    <ContainedButton onClick={pickRandomUserFromList}>
                        Seleccionar usuario
                    </ContainedButton>
                    <ContainedButton onClick={finishLottery}>
                        Eliminar recompensa
                    </ContainedButton>
                </>
            }
            <p style={{ color: '#FFF', fontSize: 18 }}>
                {helpMessage}
            </p>
        </Container>
    );
}

export default Lottery;