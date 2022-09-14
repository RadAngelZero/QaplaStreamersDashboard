import React, { useState, useEffect } from 'react';
import { Checkbox, makeStyles, Grid, Card, CardMedia, Tooltip, FormControlLabel, Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import {
    CHEERS_URI,
    LEFT,
    RIGHT
} from '../../utilities/Constants';

import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';

import Step1 from './../../assets/addCheersTutorial1.jpg';
import Step2 from './../../assets/addCheersTutorial2.jpg';
import Step3 from './../../assets/addCheersTutorial3.jpg';
import Step4 from './../../assets/addCheersTutorial4.jpg';
import ContainedButton from '../ContainedButton/ContainedButton';
import StreamerSelect from '../StreamerSelect/StreamerSelect';
import { getStreamerAlertsSettings, getStreamerChallengeCategory, setAlertSetting, writeTestCheer } from './../../services/database';

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
        fontSize: 18
    },
    container: {
        marginTop: 60,
        marginRight: 24,
        maxWidth: '633px', 
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
        fontSize:'18px',
        fontWeight: '600',
        lineHeight: '32px',
        marginBottom:'15px'
    },
    text:{
        color:'rgba(255, 255, 255, 0.6)',
        fontSize:'16px',
        fontWeight: '400',
    },
    textScreenDimension:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#202750',
        width: '67px',
        height: '28px',
        marginLeft:'16px',
        marginRight:'16px',
        borderRadius: '6px',
        color:'#00FFDD',
        fontSize:'14px',
        fontWeight: '700'
    },
    titlesSectionPosition: {
        color: '#FFFFFF',
        margin: '0px 0px 5px 0px',
        fontSize:'16px' 
    },
    subTitle:{
        color:'rgba(255, 255, 255, 0.8)',
        fontSize:'14px',
        fontWeight:'400'
    },
    Button: {
        marginTop:'80px',
        backgroundColor: '#3B4BF9',
        minWidth:'202px',
        maxWidth: '202px',
        maxHeight: '56px',
        minHeight: '56px',
        borderRadius: '16px',
        boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)',
        '&:hover':{
            backgroundColor:'#3B4BF9'
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
    const [side, setSide] = useState(LEFT);
    const [showQaplaChallengeProgress, setShowQaplaChallengeProgress] = useState(false);
    const [isUserParticipantOfQaplaChallenge, setIsUserParticipantOfQaplaChallenge] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        async function getSettings() {
            const settings = await getStreamerAlertsSettings(uid);
            if (settings.exists()) {
                setSide(settings.val().alertSideRight ? RIGHT : LEFT);

                setShowQaplaChallengeProgress(settings.val().showQaplaChallengeProgress !== false);
            }
        }

        async function checkIfUserIsUserParticipantOfQaplaChallenge() {
            const userParticipation = await getStreamerChallengeCategory(uid);
            setIsUserParticipantOfQaplaChallenge(userParticipation.exists());
        }

        if (uid) {
            getSettings();
            checkIfUserIsUserParticipantOfQaplaChallenge();
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

    const changeSide = (side) => {
        setSide(side);
        setAlertSetting(uid, 'alertSideRight', side === RIGHT);
    }

    const changeQaplaChallengeProgressBarView = (show) => {
        setShowQaplaChallengeProgress(show);
        setAlertSetting(uid, 'showQaplaChallengeProgress', show);
    }

    return (
        <Grid className={classes.container}>
            <Grid style={{height: '223px', maxWidth:'633px'}}>
                <Grid>
                    <h1 className={classes.title}>Set up Overlay for your Qapla Reactions</h1>
                    <p className={classes.text}>Add the Qapla Reactions URL as a brower source on your OBS/SLOBS. make sure to set right width and height</p>
                </Grid> 
                <Grid style={{marginTop:'30px'}}> 
                    <Grid style={{display: 'flex', alignItems: 'center'}}>
                        <h3 style={{color:'#ffffff', fontSize:'14px'}}>Width</h3>
                        <p className={classes.textScreenDimension}>1920</p>
                        <h3 style={{color:'#ffffff', fontSize:'14px'}}>Heigth</h3>
                        <p className={classes.textScreenDimension}>1080</p>
                    </Grid>
                    <Grid item xs={8} style={{ display: 'flex', alignItems: 'start', marginTop:'40px'}}>
                        <StreamerTextInput
                            textInputStyle={{ margin: '0px' }}
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
                <Grid style={{display: 'flex', marginTop:'40px'}}>
                    <Grid>
                        <Grid style={{marginBottom:'50px'}}>
                            <h2 className={classes.titlesSectionPosition}>Position</h2>
                        </Grid>
                        <Grid>
                            <h2 className={classes.titlesSectionPosition}>Reaction Alert</h2>
                            <p className={classes.subTitle}>Set the position of your alerts on your overlay</p>
                        </Grid>
                        <Grid style={{marginTop:'60px'}}>
                            <h2 className={classes.titlesSectionPosition}>Qapla On Badge</h2>
                            <p className={classes.subTitle}>Your audience can be sure their reactions will</p>
                        </Grid>
                    </Grid>
                    <Grid style={{display: 'flex', marginTop:'65px', marginLeft:'95px'}}>
                        <div >     
                            <StreamerSelect
                                 data={[
                                       {
                                            value: LEFT,
                                            label: t('Left')
                                        },
                                        {
                                            value: RIGHT,
                                            label: t('Right')
                                        }
                                    ]}
                                    style={{ minHeight: '50.5px', width: '230px', margin: '0px' }}
                                    value={side}
                                    onChange={changeSide}
                                    overflowY='hidden'
                                    overflowX='hidden' />   
                        </div>
                        <div style={{marginTop:'100px'}}>     
                            <StreamerSelect
                                 data={[
                                       {
                                            value: LEFT,
                                            label: t('Left')
                                        },
                                        {
                                            value: RIGHT,
                                            label: t('Right')
                                        }
                                    ]}
                                    style={{ minHeight: '50.5px', width: '230px', margin: '0px' }}
                                    value={side}
                                    onChange={changeSide}
                                    overflowY='hidden'
                                    overflowX='hidden' />   
                        </div>
                    </Grid>
                </Grid>
                <Button className={classes.Button}>Save and Test</Button>
            </Grid>
           
        </Grid>
    );
}

export default CheersSettings;