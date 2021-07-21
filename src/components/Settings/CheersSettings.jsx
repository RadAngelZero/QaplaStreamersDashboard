import React, { useState } from 'react';
import { makeStyles, Grid, Card, CardMedia, Tooltip } from '@material-ui/core';

import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';
import Rocket from './../../assets/RocketLeague.jpg';

const useStyles = makeStyles(() =>({
    instructionsMargin: {
        marginTop: 50
    },
    instructionTitle: {
        fontWeight: '600',
        fontSize: 18,
        color: '#FFF'
    },
    instructionDescription: {
        marginTop: 24,
        fontSize: 16,
        color: '#FFF'
    },
    link: {
        color: '#6C5DD3',
        fontWeight: '500',
        fontSize: 18
    },
    container: {
        marginTop: 60,
        marginRight: 24
    },
    cursorPointer: {
        cursor: 'pointer'
    }
}));

const InstructionSection = ({ title, description, mediaContainerComponent = 'img', src }) => {
    const classes = useStyles();

    return (
        <div className={classes.instructionsMargin}>
            <p className={classes.instructionTitle}>
                {title}
            </p>
            <p className={classes.instructionDescription}>
                {description}
            </p>
            <Grid container className={classes.instructionsMargin}>
                <Grid xs={12} sm={8} md={6}>
                    <Card>
                        <CardMedia component={mediaContainerComponent}
                            width='480'
                            height='270'
                            src={src}
                            frameborder='0'
                            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                            allowfullscreen />
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
};

const CheersSettings = ({ twitchId }) => {
    const classes = useStyles();
    const cheersURL = `https://dashboard.qapla.gg/liveDonations/${twitchId}`;
    const [openTooltip, setOpenTooltip] = useState(false);

    const copyCheersURL = () => {
        navigator.clipboard.writeText(cheersURL);
        setOpenTooltip(true);
        setTimeout(() => {
            setOpenTooltip(false);
        }, 1250);
    }

    return (
        <div className={classes.container}>
            <p className={classes.instructionTitle}>
                Recibe los mensajes de tu comunidad
            </p>
            <p className={classes.instructionDescription}>
                Muestra los mensajes de los cheers que te envía tu comunidad en tu transmisiones agregando este link a tu OBS.
            </p>
            <Grid container className={classes.instructionsMargin}>
                <Grid sm={6} xs={12}>
                    <StreamerTextInput
                        Icon={
                            <Tooltip placement='top' open={openTooltip} title='Copiado'>
                                <CopyIcon className={classes.cursorPointer} onClick={copyCheersURL} />
                            </Tooltip>
                        }
                        textInputClassName={classes.link}
                        fullWidth
                        value={cheersURL} />
                </Grid>
            </Grid>
            <InstructionSection title='¿Cómo agrego las alertas de cheers de Qapla a mi OBS?'
                description={<>¡Es muy fácil! Funciona igual que las alertas que ya conoces y tanto te gusta mostrar en tus streams :). <b>Mira este video o bien sigue las sencillas instrucciones</b> de abajo.</>}
                mediaContainerComponent='iframe'
                src='https://www.youtube.com/embed/QH2-TGUlwu4' />
            <InstructionSection title='1. Abre tu setup en tu OBS'
                description='Ve a tu OBS (StreamLabs, OBS, Stream Elements, etc.) y abre el setup con el que normalmente transmites.'
                src={Rocket} />
            <InstructionSection title='2. Abre tu setup en tu OBS'
                description='Ve a tu OBS (StreamLabs, OBS, Stream Elements, etc.) y abre el setup con el que normalmente transmites.'
                src={Rocket} />
            <div className={classes.instructionsMargin} />
        </div>
    );
}

export default CheersSettings;