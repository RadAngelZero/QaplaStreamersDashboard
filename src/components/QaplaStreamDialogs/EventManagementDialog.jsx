import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent, makeStyles } from '@material-ui/core';

import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import { ReactComponent as TickSquare } from './../../assets/TickSquare.svg';
import { sednPushNotificationToTopic, sendCustomMessage } from '../../services/functions';

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
            backgroundColor: '#00EACB'
        },
        '&:active': {
            backgroundColor: '#00EACB',
            opacity: '0.9'
        }
    },
    startText: {
        display: 'flex',
        justifyContent: 'center',
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
            background: '#2E3AC1',
        },
        '&:active': {
            background: '#2E3AC1',
            opacity: '0.9'
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
            backgroundColor: '#6C5DD3',
            opacity: '0.9'
        },
        '&:active': {
            backgroundColor: '#6C5DD3',
            opacity: '0.8'
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

const EventManagementDialog = ({ user, open, stream = null, streamStarted, streamTitle, date, hour, onClose, startStream, enableQoins, closeStream, closingStream }) => {
    const classes = useStyles();
    const [message, setMessage] = useState('');
    const [dots, setDots] = useState('')
    const [enablingQoins, setEnablingQoins] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if ((streamStarted && !stream) || (enablingQoins && !stream.qoinsEnabled)) {
            setTimeout(() => {
                if (dots.length > 2) {
                    setDots('');
                } else {
                    setDots(dots + '.');
                }
            }, 500);
        }
        if ((streamStarted && stream) && !enablingQoins && dots.length > 0) {
            setDots('');
        }
    }, [streamStarted, dots, enablingQoins]);

    const startStreamHandler = async () => {
        await startStream();
    }

    const enableQoinsHandler = async () => {
        setEnablingQoins(true);
        await enableQoins();
        setEnablingQoins(false);
    }

    const closeStreamHandler = async () => {
        closeStream();
    }

    const sendNotificationHandler = () => {
        // We need to add validations, check BioEditorTextArea to get an idea for a possible implementation
        sendCustomMessage(user.uid, streamTitle, message);
    }

    return (
        <Dialog onClose={onClose} open={open} classes={{
                container: classes.dialogContainer,
                root: classes.dialogRoot,
                paper: classes.paper
            }}
            maxWidth='sm'
            fullWidth>
            <DialogContent style={{ padding: '0px' }}>
                <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                    <CloseIcon onClick={onClose} className={classes.closeButton} />
                </div>
                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '205px', maxWidth: '210px' }}>
                        <p className={classes.title}>
                            {t('QaplaStreamDialogs.EventManagementDialog.streamActions')}
                        </p>
                        <p className={classes.subtitle}>
                            {t('QaplaStreamDialogs.EventManagementDialog.manageRewards')}
                        </p>
                        <div style={{ height: '20px' }} />
                        {(!stream && !streamStarted) &&
                            <Button
                                style={{ boxShadow: '0px 20px 40px -10px rgba(0, 255, 221, 0.2)' }}
                                onClick={startStreamHandler}
                                classes={{ root: classes.startButtonRoot }}>
                                {t('QaplaStreamDialogs.EventManagementDialog.start')}
                            </Button>
                        }

                        {!stream && streamStarted &&
                            <p className={classes.startText}>
                                {`${t('QaplaStreamDialogs.EventManagementDialog.creatingRewards')}${dots}`}
                            </p>
                        }

                        {stream && !stream.qoinsEnabled &&
                            <div style={{ display: 'flex', height: '56px', alignItems: 'center' }}>
                                <TickSquare style={{ marginTop: '7.5px' }} />
                                <p className={classes.enabledXQText}>
                                    {t('QaplaStreamDialogs.EventManagementDialog.xqEnabled')}
                                </p>
                            </div>
                        }

                        {stream && enablingQoins &&
                            <p className={classes.startText}>
                                {`${t('QaplaStreamDialogs.EventManagementDialog.enablingQoins')}${dots}`}
                            </p>
                        }

                        {stream && stream.qoinsEnabled &&
                            <div style={{ display: 'flex', height: '56px', alignItems: 'center' }}>
                                <TickSquare style={{ marginTop: '7.5px' }} />
                                <p className={classes.enabledXQText}>
                                    {t('QaplaStreamDialogs.EventManagementDialog.qoinsEnabled')}
                                </p>
                            </div>
                        }
                        <div style={{ height: '6px' }} />
                        {!enablingQoins &&
                            <Button
                                onClick={(stream && stream.qoinsEnabled) ? closeStreamHandler : enableQoinsHandler}
                                classes={{
                                    root: classes.qoinsButtonRoot,
                                    disabled: classes.qoinsButtonRootDisabled
                                }}
                                style={!stream ? { backgroundColor: '#0000' } : { boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)' }}
                                disabled={!stream || (stream && enablingQoins) || closingStream}>
                                {(stream && stream.qoinsEnabled) ?
                                    t('QaplaStreamDialogs.EventManagementDialog.end')
                                    :
                                    t('QaplaStreamDialogs.EventManagementDialog.enableQoins')
                                }
                            </Button>
                        }
                    </div>
                    <div style={{ width: '70px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '400px' }}>
                        <p className={classes.title}>
                            💬 {t('QaplaStreamDialogs.EventManagementDialog.sendMessage')}
                        </p>
                        <p className={classes.subtitle}>
                            {t('QaplaStreamDialogs.EventManagementDialog.sendMessageDetails')}
                        </p>
                        <div style={{ height: '20px' }} />
                        <StreamerTextInput
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
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
                            }}>
                            {t('QaplaStreamDialogs.EventManagementDialog.send')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
            <p style={{ position: 'absolute', right: '30px', bottom: '-40px', }} className={classes.eventName}>
                {`${streamTitle} / ${date} / ${hour}`}
            </p>
        </Dialog>
    )
}

export default EventManagementDialog;