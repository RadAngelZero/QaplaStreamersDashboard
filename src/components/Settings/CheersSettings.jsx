import React, { useState } from 'react';
import { makeStyles, Grid, Card, CardMedia, Tooltip } from '@material-ui/core';

import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';
import Rocket from './../../assets/RocketLeague.jpg';

const useStyles = makeStyles(() =>({
    link: {
        color: '#6C5DD3',
        fontWeight: '500',
        fontSize: 18
    }
}));

const InstructionSection = ({ title, description, mediaContainerComponent = 'img', src }) => (
    <div style={{ marginTop: 50 }}>
        <p style={{ fontWeight: '600', fontSize: 18, color: '#FFF' }}>
            {title}
        </p>
        <p style={{ marginTop: 24, fontSize: 16, color: '#FFF' }}>
            {description}
        </p>
        <Grid container style={{ marginTop: 55 }}>
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
        <div style={{ marginTop: 60, marginRight: 24 }}>
            <p style={{ fontWeight: '500', fontSize: 18, color: '#FFF' }}>
                Recibe los mensajes de tu comunidad
            </p>
            <p style={{ marginTop: 24, fontSize: 16, color: '#FFF' }}>
                Muestra los mensajes de los cheers que te envía tu comunidad en tu transmisiones agregando este link a tu OBS.
            </p>
            <Grid container style={{ marginTop: 50 }}>
                <Grid sm={6} xs={12}>
                    <StreamerTextInput
                        Icon={
                            <Tooltip placement='top' open={openTooltip} title='Copiado'>
                                <CopyIcon style={{ cursor: 'pointer' }} onClick={copyCheersURL} />
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
            <div style={{ marginBottom: 50 }} />
        </div>
    );
}

export default CheersSettings;