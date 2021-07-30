import React, { useState } from 'react';
import { makeStyles, Grid, Card, CardMedia, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CopyIcon } from './../../assets/CopyPaste.svg';
import Step1 from './../../assets/addCheersTutorial1.jpg';
import Step2 from './../../assets/addCheersTutorial2.jpg';
import Step3 from './../../assets/addCheersTutorial3.jpg';
import Step4 from './../../assets/addCheersTutorial4.jpg';

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
                                height='375'
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

const CheersSettings = ({ twitchId }) => {
    const classes = useStyles();
    const cheersURL = `https://dashboard.qapla.gg/liveDonations/${twitchId}`;
    const [openTooltip, setOpenTooltip] = useState(false);
    const { t } = useTranslation();

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
                {t('CheersSettings.title')}
            </p>
            <p className={classes.instructionDescription}>
                {t('CheersSettings.description')}
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
            <div className={classes.instructionsMargin} />
        </div>
    );
}

export default CheersSettings;