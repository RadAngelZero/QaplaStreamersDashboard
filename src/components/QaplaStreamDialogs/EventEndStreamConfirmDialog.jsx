import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogContent, Checkbox, makeStyles } from '@material-ui/core';

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
        padding: '64px 64px 30px 64px',
        minWidth: 'min-content'
    },
    endStreamButtonRoot: {
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
    miniDialogTitle: {
        fontSize: '18px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '24px',
        letterSpacing: '-0.02em',
        textAlign: 'center',
        maxWidth: '220px'
    },
    miniDialogSubTitle: {
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

const EventEndStreamConfirmDialog = ({ open, onClose, closeStream, closingStream }) => {
    const classes = useStyles();
    const [notShowEndStreamAgain, setNotShowEndStreamAgain] = useState(false);
    const { t } = useTranslation();

    const notShowAgainHandler = () => {
        setNotShowEndStreamAgain(!notShowEndStreamAgain);
    }

    const closeStreamHandler = async () => {
        if (notShowEndStreamAgain) {
            localStorage.setItem('dontShowCloseStreamDialog', 'true');
        }

        await closeStream();
        onClose();
    }

    return (
        <Dialog onClose={onClose} open={open} classes={{
            container: classes.dialogContainer,
            root: classes.dialogRoot,
            paper: classes.paper
        }}>
            <DialogContent style={{ padding: '0px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <p className={classes.miniDialogTitle}>
                        {t('QaplaStreamDialogs.EventEndStreamConfirmDialog.title')}
                    </p>
                    <div style={{ height: '20px' }} />
                    <p className={classes.miniDialogSubTitle}>
                        {t('QaplaStreamDialogs.EventEndStreamConfirmDialog.description')}
                    </p>
                    <div style={{ height: '30px' }} />
                    <Button
                        onClick={closeStreamHandler}
                        classes={{
                            root: classes.endStreamButtonRoot,
                        }}
                        disabled={closingStream}
                        style={{ boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)' }}>
                        {t('QaplaStreamDialogs.EventEndStreamConfirmDialog.end')}
                    </Button>
                    <Button
                        onClick={onClose}
                        classes={{
                            root: classes.goToDashboardButton,
                        }}>
                        {t('QaplaStreamDialogs.EventEndStreamConfirmDialog.back')}
                    </Button>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                            icon={<Unchecked />}
                            checkedIcon={<Checked />}
                            onChange={notShowAgainHandler}
                            checked={notShowEndStreamAgain}
                            style={{ paddingRight: '0px' }}
                        />
                        <Button
                            classes={{
                                label: classes.notShowAgainTextButton
                            }}
                            disableRipple
                            style={{ color: notShowEndStreamAgain ? '#fff' : 'darkgrey', paddingLeft: '6px' }}
                            className={classes.notShowAgain}
                            onClick={notShowAgainHandler}>
                            {t('QaplaStreamDialogs.EventEndStreamConfirmDialog.dontShowThisMessageAgain')}
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EventEndStreamConfirmDialog;