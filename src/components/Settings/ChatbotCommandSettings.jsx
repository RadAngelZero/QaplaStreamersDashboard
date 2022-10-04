import React, { useState, useEffect } from 'react';
import { Button, Card, CardContent, Grid, makeStyles, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { ReactComponent as CopyIcon } from './../../assets/Copy.svg';
import { getStreamerDeepLink } from '../../services/database';

const useStyles = makeStyles(() => ({
    title: {
        color: '#FFFFFF',
        fontSize: '18px',
        fontWeight: '600',
        lineHeight: '32px',
    },
    subTitle: {
        color: '#FFFFFF',
        fontSize: '16px',
        fontWeight: '600',
        lineHeight: '32px',
    },
    text: {
        marginTop: '16px',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '16px',
        fontWeight: '400',
        whiteSpace: 'pre-line'
    },
    createLinkCard: {
        backgroundColor: '#141735',
        borderRadius: '20px',
        padding: '24px',
        color: '#FFF',
        fontSize: '16px',
        fontWeight: '400',
        marginTop: '16px'
    },
    createLinkButton: {
        marginTop: '24px',
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
        textTransform: 'none',
    }
}))

const ChatbotCommandSettings = ({ uid }) => {
    const classes = useStyles();
    const [openTooltip1, setOpenTooltip1] = useState(false);
    const [openTooltip2, setOpenTooltip2] = useState(false);
    const [streamerLink, setStreamerLink] = useState(undefined);
    const history = useHistory();
    const { t } = useTranslation();

    useEffect(() => {
        async function getLink() {
            const link = await getStreamerDeepLink(uid);
            setStreamerLink(link.val());
        }

        if (uid) {
            getLink();
        }
    }, [uid]);


    const copyCommand = () => {
        navigator.clipboard.writeText('!qapla');
        setOpenTooltip1(true);
        setTimeout(() => {
            setOpenTooltip1(false);
        }, 1250);
    }
    const copyMessage = () => {
        let message = t('ChatbotCommandSettings.chatbotMessage').replaceAll('\n\n', ' ');
        message += ` ${(streamerLink ? streamerLink : 'https://myqap.la/download')}`
        navigator.clipboard.writeText(message);
        setOpenTooltip2(true);
        setTimeout(() => {
            setOpenTooltip2(false);
        }, 1250);
    }

    return (
        <Grid container style={{ marginTop: '40px' }} spacing={2}>
            <Grid item sm={12} md={8}>
                <div>
                    <h1 className={classes.title}>
                        Chatbot
                    </h1>
                    <p className={classes.text}>
                        {t('ChatbotCommandSettings.addCommandNormal')}
                        <b>
                            {t('ChatbotCommandSettings.addCommandBold')}
                        </b>
                    </p>
                </div>
                <div style={{
                    marginTop: '28px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <h1 className={classes.subTitle}>
                            {t('ChatbotCommandSettings.command')}
                        </h1>
                        <Tooltip placement='top' open={openTooltip1} title={t('ChatbotCommandSettings.copied')}>
                            <CopyIcon style={{
                                width: '20px',
                                height: '22px',
                                cursor: 'pointer',
                                marginLeft: '10px',
                            }}
                                onClick={() => copyCommand()}
                            />
                        </Tooltip>

                    </div>
                    <p className={classes.text}>
                        !qapla
                    </p>
                </div>
                <div style={{
                    marginTop: '28px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}>
                        <h1 className={classes.subTitle}>
                            {t('ChatbotCommandSettings.message')}
                        </h1>
                        <Tooltip placement='top' open={openTooltip2} title={t('ChatbotCommandSettings.copied')}>
                            <CopyIcon style={{
                                width: '20px',
                                height: '22px',
                                cursor: 'pointer',
                                marginLeft: '10px',
                            }}
                                onClick={() => copyMessage()}
                            />
                        </Tooltip>

                    </div>
                    <p className={classes.text} style={{ maxWidth: '270px' }}>
                        {t('ChatbotCommandSettings.chatbotMessage')}
                        {streamerLink !== undefined &&
                            (streamerLink ?
                                <span style={{ color: '#428EFF' }}> {streamerLink} </span>
                                :
                                <span style={{ color: '#428EFF' }}> https://myqap.la/download </span>
                            )
                        }
                    </p>
                </div>
            </Grid>
            {!streamerLink &&
                <Grid item sm={12} md={4}>
                    <div>
                        <h1 className={classes.title}>
                            {t('ChatbotCommandSettings.createProfileLink')}
                        </h1>
                        <Card className={classes.createLinkCard}>
                            <CardContent style={{ padding: 0, whiteSpace: 'pre-line' }}>
                                {t('ChatbotCommandSettings.createProfileLinkDescription')}
                                <span style={{ color: '#428EFF' }}> https://myqap.la/app </span>
                            </CardContent>
                            <Button className={classes.createLinkButton} onClick={() => history.push('/editProfile')}>
                                {t('ChatbotCommandSettings.createProfileLinkButton')}
                            </Button>
                        </Card>
                    </div>
                </Grid>
            }
        </Grid>
    )
}

export default ChatbotCommandSettings;