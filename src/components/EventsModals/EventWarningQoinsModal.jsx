import { Button, Dialog, DialogContent, makeStyles } from '@material-ui/core';
import React from 'react';
import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import { ReactComponent as InfoCircle } from './../../assets/InfoCircle.svg';



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
    manageRewardsButtons: {
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
}));

const EventWarningQoinsModal = ({ open, onClose }) => {
    const classes = useStyles();

    const goToManageRewards = () => {

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
                                root: classes.manageRewardsButtons,
                            }}
                            style={{ boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)' }}
                        >Gestionar recompensas</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default EventWarningQoinsModal;