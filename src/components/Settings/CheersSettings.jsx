import React, { useState, useEffect } from 'react';
import { makeStyles, Grid, Card, CardMedia, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import {
    LEFT,
    RIGHT
} from '../../utilities/Constants';

import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';

import Step1 from './../../assets/addCheersTutorial1.jpg';
import Step2 from './../../assets/addCheersTutorial2.jpg';
import Step3 from './../../assets/addCheersTutorial3.jpg';
import Step4 from './../../assets/addCheersTutorial4.jpg';
import ContainedButton from '../ContainedButton/ContainedButton';
import StreamerSelect from '../StreamerSelect/StreamerSelect';
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
    const cheersURL = `https://dashboard.qapla.gg/liveDonations/${twitchId}`;
    const [openTooltip, setOpenTooltip] = useState(false);
    const [side, setSide] = useState(LEFT);
    const { t } = useTranslation();

    useEffect(() => {
        async function getSettings() {
            const settings = await getStreamerAlertsSettings(uid);
            if (settings.exists()) {
                setSide(settings.val().alertSideRight ? RIGHT : LEFT);
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

    const changeSide = (side) => {
        setSide(side);
        setAlertSetting(uid, 'alertSideRight', side === RIGHT);
    }

    return (
        <div className={classes.container}>
            <p className={classes.instructionTitle}>
                {t('CheersSettings.title')}
            </p>
            <p className={classes.instructionDescription}>
                {t('CheersSettings.description')}
            </p>
            <Grid container className={classes.instructionsMargin}>
                <Grid container xs={10} style={{ alignItems: 'center', gap: '20px' }} >
                    <Grid item xs={4} style={{
                        display: 'flex',
                        minWidth: '230px',
                        maxWidth: '240px'
                    }}>
                        <div style={{
                            display: 'flex',
                            marginTop: '-8px',
                            maxWidth: '230px',
                            minHeight: '50.5px'
                        }}>
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
                    <Grid item xs={8} style={{ display: 'flex' }}>
                        <StreamerTextInput
                            textInputStyle={{ margin: '0px' }}
                            containerStyle={{ minWidth: '500px' }}
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
            <InstructionSection title={t('CheersSettings.instruction0.title')}
                description={<>{t('CheersSettings.instruction0.description')} <b>{t('CheersSettings.instruction0.descriptionBold')}</b></>} />
            <InstructionSection title={t('CheersSettings.instruction1.title')}
                description={t('CheersSettings.instruction1.description')} />
            <InstructionSection title={t('CheersSettings.instruction2.title')}
                src={Step1} />
            <InstructionSection title={t('CheersSettings.instruction3.title')}
                src={Step2} />
            <InstructionSection title={t('CheersSettings.instruction4.title')}
                src={Step3} />
            <InstructionSection title={t('CheersSettings.instruction5.title')}
                description={t('CheersSettings.instruction5.description')}
                src={Step4} />
            <InstructionSection title={t('CheersSettings.instruction6.title')}
                description={t('CheersSettings.instruction6.description')} />
            <ContainedButton onClick={sendTestCheer}>
                {t('CheersSettings.testButton')}
            </ContainedButton>
            <div className={classes.instructionsMargin} />
        </div>
    );
}

export default CheersSettings;