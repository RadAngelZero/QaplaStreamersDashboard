import { Button, Dialog, DialogContent, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as TickSquare } from './../../assets/TickSquare.svg';


const useStyles = makeStyles((theme) => ({
    dialogContainer: {
        backdropFilter: 'blur(10px)'
    },
    dialogRoot: {
    },
    paper: {
        backgroundColor: '#141833',
        color: '#FFF',
        overflow: 'visible',
        borderRadius: '35px',
        padding: '38px',
        minWidth: 'min-content'
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
        marginTop: '8px'
    },
    startButtonRoot: {
        backgroundColor: '#00FFDD',
        width: '200px',
        height: '56px',
        borderRadius: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#0D1021',
        textTransform: 'capitalize',
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
        fontWeight: '700',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#FFF',
        textTransform: 'capitalize',
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
        fontWeight: '700',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#FFF !important',
        textTransform: 'capitalize',
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
        fontWeight: '700',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#FFF',
        textTransform: 'capitalize',
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
    }
}));

const EventManagementModal = ({ open }) => {
    const classes = useStyles();
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
        }, 2000);
    }

    const enableQoinsHandler = () => {
        setEnablingdQoins(true);
        setTimeout(() => {
            setEnabledQoins(true)
        }, 2000);
    }

    const sendNotificationHandler = () => {
        console.log(message)
    }

    return (
        <Dialog open={open} classes={{
            container: classes.dialogContainer,
            root: classes.dialogRoot,
            paper: classes.paper
        }}>
            <DialogContent>
                <div style={{ display: 'flex' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '205px', maxWidth: '210px' }}>
                        <p className={classes.title}>⚡️ Acciones de stream</p>
                        <p className={classes.subtitle}>Gestiona las recompensas de tu stream.</p>
                        <div style={{ height: '20px' }} />
                        {!streamStarted &&
                            <Button
                                onClick={startStreamHandler}
                                classes={{
                                    root: classes.startButtonRoot
                                }}>Iniciar stream</Button>
                        }
                        {streamStarted && !enabledXQ &&
                            <p className={classes.startText}>Creando recompensas{dots}</p>
                        }
                        {streamStarted && enabledXQ &&
                            <div style={{ display: 'flex', height: '56px', alignItems: 'center' }}>
                                <TickSquare style={{ marginTop: '7.5px' }} />
                                <p className={classes.enabledXQText}>XQ habilitados</p>
                            </div>
                        }
                        <div style={{ height: '6px' }} />
                        {!enablingQoins &&
                            <Button
                                onClick={enableQoinsHandler}
                                classes={{
                                    root: classes.qoinsButtonRoot,
                                    disabled: classes.qoinsButtonRootDisabled
                                }}
                                style={!streamStarted ? { backgroundColor: '#0000' } : {}}
                                disabled={!(streamStarted && enabledXQ)}
                            >Habilitar Qoins</Button>
                        }
                        {enablingQoins && !enabledQoins &&
                            <p className={classes.startText}>Habilitando Qoins{dots}</p>
                        }
                        {enablingQoins && enabledQoins &&
                            <div style={{ display: 'flex', height: '56px', alignItems: 'center' }}>
                                <TickSquare style={{ marginTop: '7.5px' }} />
                                <p className={classes.enabledXQText}>Qoins habilitados</p>
                            </div>
                        }
                    </div>
                    <div style={{ width: '60px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: '440px' }}>
                        <p className={classes.title}>💬 Enviar mensaje</p>
                        <p className={classes.subtitle}>Avisa a tu gente algo relevante sobre tu stream, crea hype o lo que tu quieras! Tus seguidores recibirán una notificación móvil con tu mensaje. </p>
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
                        >Enviar</Button>
                    </div>
                </div>
            </DialogContent>
            <p style={{ position: 'absolute', right: '30px', bottom: '-40px', }} className={classes.eventName}>Exploring Astraland 🌙 / 30 Apr / 10:30 p.m.</p>

        </Dialog>
    )
}

export default EventManagementModal;