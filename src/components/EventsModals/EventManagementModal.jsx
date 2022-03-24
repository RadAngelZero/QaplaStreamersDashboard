import { Button, Dialog, DialogContent, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import { ReactComponent as TickSquare } from './../../assets/TickSquare.svg';

const useStyles = makeStyles((theme) => ({
    dialogContainer: {
        backdropFilter: 'blur(50px)'
    },
    dialogRoot: {
    },
    paper: {
        backgroundColor: '#141833',
        color: '#FFF',
        overflow: 'visible',
        borderRadius: '35px',
        padding: '64px',
        minWidth: 'min-content'
    },
    closeButton: {
        '&:hover': {
            cursor: 'pointer'
        }
    },
    title: {
        fontSize: '18px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '32px',
        letterSpacing: '0px'
    },
    subtitle: {
        color: '#FFFFFF9A',
        fontSize: '12px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '18px',
        letterSpacing: '0px',
        marginTop: '8px',
    },
    startButtonRoot: {
        backgroundColor: '#00FFDD',
        width: '200px',
        height: '56px',
        borderRadius: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#0D1021',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#7fffee'
        }
    },
    startText: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '22px',
        letterSpacing: '0.492000013589859px',
        height: '56px',
        borderRadius: '16px',
        color: '#FFFFFF'
    },
    enabledXQText: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '22px',
        letterSpacing: '0.492000013589859px',
        height: '56px',
        color: '#00FFDD'
    },
    qoinsButtonRoot: {
        backgroundColor: '#3B4BF9',
        width: '200px',
        height: '56px',
        borderRadius: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#FFF',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#7581fa'
        }
    },
    qoinsButtonRootDisabled: {
        backgroundColor: '#3B4BF9',
        width: '200px',
        height: '56px',
        borderRadius: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#FFF !important',
        textTransform: 'none',
        opacity: '0.2'
    },
    textInputContainer: {
        backgroundColor: '#202750',
        borderRadius: '16px',
        paddingRight: '4px',
        overflow: 'hidden'
    },
    sendButtonRoot: {
        backgroundColor: '#6C5DD3',
        width: '165px',
        height: '56px',
        borderRadius: '16px',
        alignSelf: 'flex-end',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#FFF',
        textTransform: 'none',
        '&:hover': {
            backgroundColor: '#897ddb',
        }
    },
    eventName: {
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '24px',
        letterSpacing: '0px'
    },
}));

const EventManagementModal = ({ open, onClose, date, hour, eventName }) => {
    // date and hour must be the same as we use on utils
    const classes = useStyles();
    const { t } = useTranslation();
    const [message, setMessage] = useState('');
    const [streamStarted, setStreamStarted] = useState(false);
    const [dots, setDots] = useState('')
    const [enabledXQ, setEnabledXQ] = useState(false);
    const [enablingQoins, setEnablingdQoins] = useState(false);
    const [enabledQoins, setEnabledQoins] = useState(false);

    useEffect(() => {
        if ((streamStarted && !enabledXQ) || (enablingQoins && !enabledQoins)) {
            setTimeout(() => {
                console.log('timeout')
                if (dots.length > 2) {
                    console.log('reset')
                    setDots('')
                } else {
                    console.log('increase')
                    setDots(dots + '.')
                }
            }, 500);
        }
        if ((streamStarted && enabledXQ) && !enablingQoins && dots.length > 0) {
            console.log('reset all dots')
            setDots('')
        }
    }, [streamStarted, enabledXQ, dots, enablingQoins, enabledQoins])

    const startStreamHandler = () => {
        setStreamStarted(true);
        setTimeout(() => {
            setEnabledXQ(true)
        }, 5000);
    }

    const enableQoinsHandler = () => {
        setEnablingdQoins(true);
        setTimeout(() => {
            setEnabledQoins(true)
        }, 2000);
    }

    const endStreamHandler = () => {

    }

    const sendNotificationHandler = () => {
        console.log(message)
    }

    return (
        <>
            <Dialog onClose={onClose} open={open} classes={{
                container: classes.dialogContainer,
                root: classes.dialogRoot,
                paper: classes.paper
            }}>
                <DialogContent style={{ padding: '0px' }}>
                    <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                        <CloseIcon onClick={onClose} className={classes.closeButton} />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '205px', maxWidth: '210px' }}>
                            <p className={classes.title}>{t('StreamModal.streamActions')}</p>
                            <p className={classes.subtitle}>{t('StreamModal.manageRewards')}</p>
                            <div style={{ height: '20px' }} />
                            {!(enablingQoins || enabledQoins) &&
                                <>
                                    {!streamStarted &&
                                        <Button
                                            style={{ boxShadow: '0px 20px 40px -10px rgba(0, 255, 221, 0.2)' }}
                                            onClick={startStreamHandler}
                                            classes={{
                                                root: classes.startButtonRoot
                                            }}>{t('StreamCard.startStream')}</Button>
                                    }
                                    {streamStarted && !enabledXQ &&
                                        <p className={classes.startText}>{t('StreamModal.creatingRewards')}{dots}</p>
                                    }
                                    {streamStarted && enabledXQ &&
                                        <div style={{ display: 'flex', height: '56px', alignItems: 'center' }}>
                                            <TickSquare style={{ marginTop: '7.5px' }} />
                                            <p className={classes.enabledXQText}>{t('StreamModal.XQEnabled')}</p>
                                        </div>
                                    }
                                </>
                            }
                            {enablingQoins && !enabledQoins &&
                                <p className={classes.startText}>{t('StreamModal.enablingQoins')}{dots}</p>
                            }
                            {enablingQoins && enabledQoins &&
                                <div style={{ display: 'flex', height: '56px', alignItems: 'center' }}>
                                    <TickSquare style={{ marginTop: '7.5px' }} />
                                    <p className={classes.enabledXQText}>{t('StreamModal.qoinsEnabled')}</p>
                                </div>
                            }
                            <div style={{ height: '6px' }} />
                            <Button
                                onClick={(enablingQoins && enabledQoins) ? endStreamHandler : enableQoinsHandler}
                                classes={{
                                    root: classes.qoinsButtonRoot,
                                    disabled: classes.qoinsButtonRootDisabled
                                }}
                                style={!streamStarted ? { backgroundColor: '#0000' } : (streamStarted && enabledXQ) ? { boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)' } : {}}
                                disabled={!(streamStarted && enabledXQ) || (enablingQoins && !enabledQoins)}
                            >{(enablingQoins && enabledQoins) ? 'Terminar stream' : 'Habilitar Qoins'}</Button>
                        </div>
                        <div style={{ width: '70px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '400px' }}>
                            <p className={classes.title}>{t('StreamModal.sendMessage')}</p>
                            <p className={classes.subtitle}>{t('StreamModal.sendMessageDescription')}</p>
                            <div style={{ height: '20px' }} />
                            <StreamerTextInput
                                value={message}
                                onChange={(e) => { setMessage(e.target.value) }}
                                textInputStyle={{ marginTop: '0px' }}
                                textInputClassName={classes.textInputContainer}
                                fullWidth
                                multiline
                                rows={6}
                                maxRows={6}
                                rowsMax={6}
                            />
                            <div style={{ height: '12px' }} />
                            <Button
                                onClick={sendNotificationHandler}
                                classes={{
                                    root: classes.sendButtonRoot
                                }}
                            >{t('StreamModal.send')}</Button>
                        </div>
                    </div>
                </DialogContent>
                <p style={{ position: 'absolute', right: '30px', bottom: '-40px', }} className={classes.eventName}>
                    {eventName} / {date.slice(0, -5)} / {hour.split(':')[0] > 12 ? (hour.split(':')[0] - 12).toString().padStart(2, '0') : hour.split(':')[0]}:{hour.split(':')[1]} {hour.split(':')[0] > 12 ? 'p.m.' : 'a.m.'}
                </p>
            </Dialog>
        </>
    )
}

export default EventManagementModal;