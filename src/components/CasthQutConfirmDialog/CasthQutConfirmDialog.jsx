import React from 'react'
import { useTranslation } from "react-i18next";
import { Dialog, makeStyles } from '@material-ui/core';

import style from './CasthQutConfirmDialog.module.css'

import {ReactComponent as TickCircle} from './../../assets/TickCircle.svg';

const useStyles = makeStyles((theme) => ({
    dialogContainer: {
    backdropFilter: "blur(20px)",
    },
    dialogRoot: {},
    paper: {
    backgroundColor: "#141833",
    color: "#FFF",
    overflow: "visible",
    borderRadius: "35px",
    },
}));

const CasthQutConfirmDialog = ({ amountBits, setOpenConfirm, onClose, open }) => {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <Dialog onClose={onClose}
          open={open}
          classes={{
          container: classes.dialogContainer,
          root: classes.dialogRoot,
          paper: classes.paper,
        }}>
            <div style={{ width: '347px', height: '384px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <div className={style.container}>
                <TickCircle className={style.tick}/>
                <p>
                    {t('StreamerProfile.BarProgressBit.weGotYouRequestP1')}
                    <span style={{ color: '#00FFDD' }}>
                    {amountBits.toLocaleString()}
                    </span>
                    {t('StreamerProfile.BarProgressBit.weGotYouRequestP2')}
                </p>
                <button onClick={() =>setOpenConfirm(false)}>Go to Dashboard</button>
                </div>
            </div>
        </Dialog>
    )
}


export default CasthQutConfirmDialog;