import React from 'react';
import { Button, Dialog, DialogContent, makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { ReactComponent as CloseIcon } from './../../assets/CloseIcon.svg';
import { ReactComponent as InfoCircle } from './../../assets/InfoCircle.svg';

const useStyles = makeStyles((theme) => ({
    dialogContainer: {
        backdropFilter: 'blur(50px)'
    },
    dialogRoot: {
    },
    paper: {
        width: '400px',
        backgroundColor: '#141833',
        color: '#FFF',
        overflow: 'visible',
        borderRadius: '35px',
        padding: '40px 30px',
        minWidth: 'min-content'
    },
    closeButton: {
        '&:hover': {
            cursor: 'pointer'
        }
    },
    manageRewardsButtons: {
        backgroundColor: '#3B4BF9',
        height: '56px',
        width: '100%',
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
        width: '80%'
    },
    miniDialogSubTitle: {
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '19px',
        letterSpacing: '0em',
        textAlign: 'center',
        width: '90%',
        color: 'darkgrey',
    },
}));

const NoAffiliateDialog = ({ open, onClose }) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <Dialog onClose={onClose} open={open} classes={{
            container: classes.dialogContainer,
            root: classes.dialogRoot,
            paper: classes.paper
        }} maxWidth='xl'>
            <DialogContent style={{ padding: '0px' }}>
                <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
                    <CloseIcon onClick={onClose} className={classes.closeButton} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', width: '90px', height: '90px' }}>
                        <div style={{ position: 'absolute', backgroundColor: 'rgba(252, 255, 107, 0.3)', width: '90px', height: '45px', marginTop: '50px', borderRadius: '40%', filter: 'blur(20px)' }} />
                        <InfoCircle style={{ width: '90px', height: '90px' }} />
                    </div>
                    <div style={{ height: '32px' }} />
                    <p className={classes.miniDialogTitle}>
                        {t('NoAffiliateDialog.becomeAffiliate')}
                    </p>
                    <div style={{ height: '32px' }} />
                    <p className={classes.miniDialogSubTitle}>
                        {t('NoAffiliateDialog.qaplaFeaturesP1')}
                    </p>
                    <p className={classes.miniDialogSubTitle}>
                        <br />
                        {t('NoAffiliateDialog.qaplaFeaturesP2')}
                        <b>
                            {t('NoAffiliateDialog.qaplaFeaturesP3')}
                        </b>
                    </p>
                    <div style={{ height: '28px' }} />

                    <Button
                        onClick={onClose}
                        classes={{
                            root: classes.manageRewardsButtons,
                        }}
                        style={{ boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)' }}>
                        {t('NoAffiliateDialog.understood')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default NoAffiliateDialog;