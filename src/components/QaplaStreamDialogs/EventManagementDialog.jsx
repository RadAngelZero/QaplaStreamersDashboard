import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent, makeStyles } from '@material-ui/core';

import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import { ReactComponent as TickSquare } from './../../assets/TickSquare.svg';
import ModalQoinsDrops from '../ModalQoinsDrops/ModalQoinsDrops';

const useStyles = makeStyles((theme) => ({
    dialogContainer: {
        backdropFilter: 'blur(50px)',
        [theme.breakpoints.down('md')]: {
            backgroundColor: '#141833',
        }
    },
    dialogRoot: {
    },
    paper: {
        backgroundColor: '#141833',
        color: '#FFF',
        overflow: 'visible',
        borderRadius: '35px',
        padding: '64px',
        minWidth: 'min-content',
        [theme.breakpoints.down('md')]: {
            minWidth: '100%',
            minHeight: '100%',
        }
    },
    itemsContainer: {
        display: 'flex',
        [theme.breakpoints.down('md')]: {
            padding: '184px 66px 20px 66px',
        },
        [theme.breakpoints.down('sm')]: {
            flexWrap: 'wrap',
            gap: '50px 0px'
        }
    },
    closeButtonContainer: {
        position: 'absolute',
        top: '24px',
        right: '24px',
        [theme.breakpoints.down('md')]: {
            top: '118px',
            right: '128px',
        }
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
    enabledRewardText: {
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
        height: '100px',
        backgroundColor: '#202750',
        borderRadius: '16px',
        paddingRight: '4px',
        overflow: 'hidden'
    },
    sendContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        [theme.breakpoints.up('md')]: {
            minWidth: '400px',
        },
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
    eventNameContainer: {
        display: 'flex',
        flexDirection: 'row',
        position: 'absolute',
        right: '30px',
        bottom: '-40px',
        gap: '0px 5px',
        [theme.breakpoints.down('md')]: {
            top: '98px',
            left: '128px',
            bottom: 'auto',
            width: '60%',
            // right: 'auto',
            paddingTop: '30px',
            backgroundColor: '#141833'
        },
        [theme.breakpoints.down('xs')]: {
            top: '148px',
            left: '128px',
            bottom: 'auto',
            right: 'auto',
            paddingTop: '30px',
            flexWrap: 'wrap',
            flexDirection: 'column',
        },

        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '24px',
        letterSpacing: '0px',
    },
    eventName: {
        background: 'linear-gradient(90deg, #E5BAFF 0%, #FFFCC0 44.48%), #FFFFFF',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
}));

const EventManagementDialog = ({ open, stream = null, streamStarted, streamTitle, date, hour, onClose, startStream, enableQoins, closeStream, closingStream, sendMessage }) => {
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

    const sendNotificationHandler = async () => {
        // We need to add validations, check BioEditorTextArea to get an idea for a possible implementation
        await sendMessage(message);
        setMessage('');
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
                <div className={classes.closeButtonContainer}>
                    <CloseIcon onClick={onClose} className={classes.closeButton} />
                </div>
                <div className={classes.itemsContainer}>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '210px', width: '210px', marginRight: '70px' }}>
                        <ModalQoinsDrops
                            stream={stream}
                            streamStarted={streamStarted}
                            closingStream={closingStream}
                            startStream={startStream}
                            enableQoins={enableQoins} />
                    </div>
                    <div className={classes.sendContainer}>
                        <p className={classes.title}>
                            💬 {t('QaplaStreamDialogs.EventManagementDialog.sendMessage')}
                        </p>
                        <p className={classes.subtitle}>
                            {t('QaplaStreamDialogs.EventManagementDialog.sendMessageDetails')}
                        </p>
                        <div style={{ height: '20px' }} />
                        <StreamerTextInput
                            value={message}
                            textInputStyle={{ paddingTop: '24px' }}
                            onChange={(e) => setMessage(e.target.value)}
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
            <div className={classes.eventNameContainer}>
                <p className={classes.eventName}>
                    {`${streamTitle} `}
                </p>
                <p>
                    {`/ ${date} / ${hour}`}
                </p>
            </div>

        </Dialog>
    )
}

export default EventManagementDialog;