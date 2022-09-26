import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent, makeStyles } from '@material-ui/core';

import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import { ReactComponent as TickCircle } from './../../assets/TickCircle.svg';

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
            background: '#2E3AC1',
        },
        '&:active': {
            background: '#2E3AC1',
            opacity: '0.9'
        }
    },
    miniDialogTitle: {
        fontSize: '18px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '24px',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        maxWidth: '220px'
    },
}));

const EventConfirmStartDialog = ({ open, onClose, manageRewards }) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
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
                        <div style={{ position: 'absolute', backgroundColor: 'rgba(0, 255, 221, 0.3)', width: '90px', height: '45px', marginTop: '50px', borderRadius: '40%', filter: 'blur(20px)' }} />
                        <TickCircle style={{ width: '90px', height: '90px' }} />
                    </div>
                    <div style={{ height: '34px' }} />
                    <p className={classes.miniDialogTitle}>
                        {/* We must change this text */}
                        {t('QaplaStreamDialogs.EventConfirmStartDialog.xqAvailable')}
                    </p>
                    <div style={{ height: '28px' }} />
                    <Button
                        onClick={manageRewards}
                        classes={{
                            root: classes.manageRewardsButtons,
                        }}
                        style={{ boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)' }}>
                        {t('QaplaStreamDialogs.EventConfirmStartDialog.manageRewards')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EventConfirmStartDialog;