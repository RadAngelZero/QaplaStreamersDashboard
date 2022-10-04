import React, { useState, useEffect } from 'react';
import { makeStyles, Grid, Card, CardMedia, Tooltip, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import GridSelector from '../GridSelector/GridSelector';

import {
    CHEERS_URI,
    LEFT,
    RIGHT
} from '../../utilities/Constants';

import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';

import interactionImage from '../../assets/Interaction.png';
import qaplaLogoLeft from '../../assets/Qapla-On-Overlay-Left.png';
import qaplaLogoRight from '../../assets/Qapla-On-Overlay-Right.png';
import { getStreamerAlertsSettings, setAlertSetting, writeTestCheer } from './../../services/database';

const useStyles = makeStyles(() => ({
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
    instructionMediaCard: {
        borderRadius: 20
    },
    link: {
        color: '#6C5DD3',
        fontWeight: '500',
        fontSize: '14px'
    },
    container: {
        marginTop: 40,
        marginRight: 24,
        maxHeight: '100vh',
        minHeight: '100vh'
    },
    cursorPointer: {
        cursor: 'pointer'
    },
    checkboxColor: {
        color: '#0AFFD2 !important'
    },
    title: {
        color: '#FFFFFF',
        fontSize: '18px',
        fontWeight: '600',
        lineHeight: '32px',
        marginBottom: '15px'
    },
    text: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '16px',
        fontWeight: '400',
    },
    textScreenDimension: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#202750',
        width: '67px',
        height: '28px',
        marginLeft: '16px',
        marginRight: '16px',
        borderRadius: '6px',
        color: '#00FFDD',
        fontSize: '14px',
        fontWeight: '700'
    },
    titlesSectionPosition: {
        color: '#FFFFFF',
        margin: '0px 0px 5px 0px',
        fontSize: '16px'
    },
    subTitle: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '14px',
        fontWeight: '400'
    },
    Button: {
        marginTop: '80px',
        backgroundColor: '#3B4BF9',
        minWidth: '202px',
        maxWidth: '202px',
        maxHeight: '56px',
        minHeight: '56px',
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '0.49',
        borderRadius: '16px',
        boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)',
        '&:hover': {
            backgroundColor: '#3B4BF9'
        },
        color: '#FFFFFF',
        textTransform: 'capitalize',
    }
}));

const InstructionSection = ({ title, description, mediaContainerComponent = 'img', src }) => {
    const classes = useStyles();

    return (
        <div className={classes.instructionsMargin}>
            <p className={classes.instructionTitle}>
                {title}
            </p>
            {description &&
                <p className={classes.instructionDescription}>
                    {description}
                </p>
            }
            {src &&
                <Grid container className={classes.instructionsMargin}>
                    <Grid xs={12} sm={8} md={7}>
                        <Card className={classes.instructionMediaCard}>
                            <CardMedia component={mediaContainerComponent}
                                width='480'
                                height='475'
                                src={src}
                                frameborder='0'
                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                allowfullscreen />
                        </Card>
                    </Grid>
                </Grid>
            }
        </div>
    );
};

const CheersSettings = ({ uid, twitchId }) => {
    const classes = useStyles();
    const cheersURL = `${CHEERS_URI}/${twitchId}`;
    const [openTooltip, setOpenTooltip] = useState(false);
    const [overlayAreaSelected, setOverlayAreaSelected] = useState(null);
    const [overlayAreaSelectedQaplaLogo, setOverlayAreaSelectedQaplaLogo] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        async function getSettings() {
            const settings = await getStreamerAlertsSettings(uid);
            if (settings.exists()) {
                setOverlayAreaSelected(settings.val().reactionGridIndex || 0);
                setOverlayAreaSelectedQaplaLogo(settings.val().qaplaOnGridIndex || 0);
            }
        }

        if (uid) {
            getSettings();
        }
    }, [uid]);

    const copyCheersURL = () => {
        navigator.clipboard.writeText(cheersURL);
        setOpenTooltip(true);
        setTimeout(() => {
            setOpenTooltip(false);
        }, 1250);
    }

    const sendTestCheer = () => {
        writeTestCheer(uid, t('CheersSettings.testCheerSuccess'), t('CheersSettings.testCheerError'));
    }

    const setReactionPosition = async (coordinates, index) => {
        setOverlayAreaSelected(index);
        await setAlertSetting(uid, 'reactionGridIndex', index);
        await setAlertSetting(uid, 'reactionCoordinates', coordinates);
    }

    const setQaplaOnPosition = async (coordinates, index) => {
        setOverlayAreaSelectedQaplaLogo(index);
        await setAlertSetting(uid, 'qaplaOnGridIndex', index);
        await setAlertSetting(uid, 'qaplaOnCoordinates', coordinates);
    }

    return (
        <Grid className={classes.container}>
            <Grid style={{ height: '223px', maxWidth: '633px' }}>
                <Grid>
                    <h1 className={classes.title}>
                        {t('CheersSettings.setup')}
                    </h1>
                    <p className={classes.text}>
                        {t('CheersSettings.instructions')}
                    </p>
                </Grid>
                <Grid style={{ marginTop: '30px' }}>
                    <Grid style={{ display: 'flex', alignItems: 'center' }}>
                        <h3 style={{ color: '#ffffff', fontSize: '14px' }}>
                            {t('CheersSettings.width')}
                        </h3>
                        <p className={classes.textScreenDimension}>
                            1920
                        </p>
                        <h3 style={{ color: '#ffffff', fontSize: '14px' }}>
                            {t('CheersSettings.height')}
                        </h3>
                        <p className={classes.textScreenDimension}>
                            1080
                        </p>
                    </Grid>
                    <Grid item xs={8} style={{ display: 'flex', alignItems: 'start', marginTop: '40px' }}>
                        <StreamerTextInput
                            textInputStyle={{ height: 45, margin: '0px', paddingTop: 0, paddingBottom: 0 }}
                            containerStyle={{ minWidth: '400px' }}
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
            </Grid>
            <Grid container className={classes.instructionsMargin} xs={12}>
                <div>
                    <h1 className={classes.title} style={{
                        marginTop: '18px',
                        marginBottom: '32px',
                    }}>
                        {t('CheersSettings.position')}
                    </h1>
                    <div style={{
                        display: 'flex',
                        flex: 1,
                        // flexDirection: 'row',
                        flexWrap: 'wrap',
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <div style={{
                                marginBottom: '16px',
                            }}>
                                <h2 className={classes.titlesSectionPosition}>
                                    {t('CheersSettings.reactionAlert')}
                                </h2>
                                <p className={classes.subTitle}>
                                    {t('CheersSettings.setReactionPosition')}
                                </p>
                            </div>
                            <div style={{
                                height: '360px',
                                width: '480px',
                                display: 'flex',
                                marginRight: '5vw',
                                marginBottom: '4vh',
                            }}>
                                {overlayAreaSelected !== null &&
                                    <GridSelector
                                        selected={overlayAreaSelected}
                                        onAreaClick={setReactionPosition}
                                        rows={3}
                                        columns={3}
                                        backgroundImage="https://static.bandainamcoent.eu/high/elden-ring/elden-ring/03-news/Starter_Guide/Elden_Ring_game_screen.jpg"
                                    >
                                        <img src={interactionImage} alt='Interaction'
                                            style={{
                                                flex: 1,
                                                objectFit: 'contain',
                                                width: '100%',
                                                height: '100%',
                                                padding: '12px',
                                                webkitBoxSizing: 'border-box',
                                                mozBoxSizing: 'border-box',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </GridSelector>
                                }
                            </div>
                        </div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <div style={{
                                marginBottom: '16px',
                            }}>
                                <h2 className={classes.titlesSectionPosition}>
                                    Qapla On Badge
                                </h2>
                                <p className={classes.subTitle}>
                                    {t('CheersSettings.qaplaOnFunctionality')}
                                </p>
                            </div>
                            <div style={{
                                height: '360px',
                                width: '480px',
                                display: 'flex',
                            }}>
                                {overlayAreaSelectedQaplaLogo !== null &&
                                    <GridSelector
                                        selected={overlayAreaSelectedQaplaLogo}
                                        onAreaClick={setQaplaOnPosition}
                                        columns={2}
                                        backgroundImage="https://static.bandainamcoent.eu/high/elden-ring/elden-ring/03-news/Starter_Guide/Elden_Ring_game_screen.jpg"
                                        Variants={[
                                            () => (
                                                <div style={{
                                                    display: 'flex',
                                                    flex: 1,
                                                    height: '100%',
                                                    alignItems: 'flex-end',
                                                }}>
                                                    <img src={qaplaLogoLeft} alt="qapla logo left"
                                                        style={{
                                                            width: '20%',
                                                            objectFit: 'scale-down',
                                                        }} />
                                                </div>
                                            )
                                            ,
                                            () => (
                                                <div style={{
                                                    display: 'flex',
                                                    flex: 1,
                                                    height: '100%',
                                                    alignItems: 'flex-end',
                                                    justifyContent: 'flex-end',
                                                }}>
                                                    <img src={qaplaLogoRight} alt="qapla logo right"
                                                        style={{
                                                            width: '20%',
                                                            objectFit: 'scale-down',
                                                        }} />
                                                </div>
                                            )
                                        ]}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </Grid>
            <Button className={classes.Button} onClick={sendTestCheer}>
                {t('CheersSettings.testButton')}
            </Button>
            <div className={classes.instructionsMargin} style={{ height: '20px' }} />
        </Grid>
    );
}

export default CheersSettings;