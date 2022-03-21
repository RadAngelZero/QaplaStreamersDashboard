import { Button, Dialog, DialogContent, Checkbox, makeStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import { ReactComponent as TickSquare } from './../../assets/TickSquare.svg';
import { ReactComponent as TickCircle } from './../../assets/TickCircle.svg';
import { ReactComponent as InfoCircle } from './../../assets/InfoCircle.svg';
import { ReactComponent as Unchecked } from './../../assets/Unchecked.svg';
import { ReactComponent as Checked } from './../../assets/Checked.svg';



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
    paperEndStream: {
        backgroundColor: '#141833',
        color: '#FFF',
        overflow: 'visible',
        borderRadius: '35px',
        padding: '64px 64px 30px 64px',
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
    miniModalTitle: {
        fontSize: '18px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '24px',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        maxWidth: '220px'
    },
    miniModalSubTitle: {
        fontSize: '12px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '16px',
        letterSpacing: '0em',
        textAlign: 'center',
        color: 'darkgrey',
        maxWidth: '220px'
    },
    goToDashboardButton: {
        backgroundColor: '#0000',
        width: '200px',
        height: '56px',
        borderRadius: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '0.49px',
        color: '#3B4BF9',
        textTransform: 'none',
    },
    notShowAgainTextButton: {
        fontSize: '10px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '16px',
        letterSpacing: '0em',
        textTransform: 'none'
    }
}));

const EventManagementModal = ({ openMain, openConfirm, openWarning, openEndStream, onCloseMain, onCloseConfirm, onCloseWarning, onCloseEndStream }) => {
    const classes = useStyles();
    const [message, setMessage] = useState('');
    const [streamStarted, setStreamStarted] = useState(false);
    const [dots, setDots] = useState('')
    const [enabledXQ, setEnabledXQ] = useState(false);
    const [enablingQoins, setEnablingdQoins] = useState(false);
    const [enabledQoins, setEnabledQoins] = useState(false);
    const [notShowEndStreamAgain, setNotShowEndStreamAgain] = useState(false)

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
    const goToManageRewards = () => {

    }

    const notShowAgainHandler = () => {
        setNotShowEndStreamAgain(!notShowEndStreamAgain)
    }

    const sendNotificationHandler = () => {
        console.log(message)
    }

    return (
        <>
            <Dialog onClose={onCloseMain} open={openMain} classes={{
                container: classes.dialogContainer,
                root: classes.dialogRoot,
                paper: classes.paper
            }}>
                <DialogContent style={{ padding: '0px' }}>
                    <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                        <CloseIcon onClick={onCloseMain} className={classes.closeButton} />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: '205px', maxWidth: '210px' }}>
                            <p className={classes.title}>⚡️ Acciones de stream</p>
                            <p className={classes.subtitle}>Gestiona las recompensas de tu stream.</p>
                            <div style={{ height: '20px' }} />
                            {!(enablingQoins || enabledQoins) &&
                                <>
                                    {!streamStarted &&
                                        <Button
                                            style={{ boxShadow: '0px 20px 40px -10px rgba(0, 255, 221, 0.2)' }}
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
                                </>
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
            <Dialog onClose={onCloseConfirm} open={openConfirm} classes={{
                container: classes.dialogContainer,
                root: classes.dialogRoot,
                paper: classes.paper
            }}>
                <DialogContent style={{ padding: '0px' }}>
                    <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                        <CloseIcon onClick={onCloseMain} className={classes.closeButton} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', width: '90px', height: '90px' }}>
                            <div style={{ position: 'absolute', backgroundColor: 'rgba(0, 255, 221, 0.3)', width: '90px', height: '45px', marginTop: '50px', borderRadius: '40%', filter: 'blur(20px)' }} />
                            <TickCircle style={{ width: '90px', height: '90px' }} />
                        </div>
                        <div style={{ height: '34px' }} />
                        <p className={classes.miniModalTitle} >¡Ya se puede minar XQ en tu stream!</p>
                        <div style={{ height: '28px' }} />

                        <Button
                            onClick={goToManageRewards}
                            classes={{
                                root: classes.qoinsButtonRoot,
                            }}
                            style={{ boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)' }}
                        >Gestionar recompensas</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog onClose={onCloseWarning} open={openWarning} classes={{
                container: classes.dialogContainer,
                root: classes.dialogRoot,
                paper: classes.paper
            }}>
                <DialogContent style={{ padding: '0px' }}>
                    <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                        <CloseIcon onClick={onCloseMain} className={classes.closeButton} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', width: '90px', height: '90px' }}>
                            <div style={{ position: 'absolute', backgroundColor: 'rgba(252, 255, 107, 0.3)', width: '90px', height: '45px', marginTop: '50px', borderRadius: '40%', filter: 'blur(20px)' }} />
                            <InfoCircle style={{ width: '90px', height: '90px' }} />
                        </div>
                        <div style={{ height: '34px' }} />
                        <p className={classes.miniModalTitle}>Habilita los Qoins</p>
                        <div style={{ height: '10px' }} />
                        <p className={classes.miniModalSubTitle}>Habilita los Qoins para la audiencia antes de terminar un stream 🙌</p>
                        <div style={{ height: '28px' }} />

                        <Button
                            onClick={goToManageRewards}
                            classes={{
                                root: classes.qoinsButtonRoot,
                            }}
                            style={{ boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)' }}
                        >Gestionar recompensas</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <Dialog onClose={onCloseEndStream} open={openEndStream} classes={{
                container: classes.dialogContainer,
                root: classes.dialogRoot,
                paper: classes.paperEndStream
            }}>
                <DialogContent style={{ padding: '0px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <p className={classes.miniModalTitle}>Termina tu stream para eliminar las recompensas</p>
                        <div style={{ height: '20px' }} />
                        <p className={classes.miniModalSubTitle}>Si aún no quieres eliminar las recompensas vuelve al dashboard</p>
                        <div style={{ height: '30px' }} />
                        <Button
                            onClick={endStreamHandler}
                            classes={{
                                root: classes.qoinsButtonRoot,
                            }}
                            style={{ boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)' }}
                        >Terminar stream</Button>
                        <Button
                            onClick={onCloseEndStream}
                            classes={{
                                root: classes.goToDashboardButton,
                            }}
                        >Volver al dashboard</Button>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Checkbox
                                icon={<Unchecked />}
                                checkedIcon={<Checked />}
                                onChange={notShowAgainHandler}
                                checked={notShowEndStreamAgain}
                                style={{paddingRight: '0px'}}
                            />
                            <Button
                                classes={{
                                    label: classes.notShowAgainTextButton
                                }}
                                disableRipple
                                style={{ color: notShowEndStreamAgain ? '#fff' : 'darkgrey', paddingLeft: '6px' }}
                                className={classes.notShowAgain}
                                onClick={notShowAgainHandler}
                            >No volver a mostrar este mensaje</Button>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default EventManagementModal;