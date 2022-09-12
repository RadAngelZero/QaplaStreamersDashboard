import React from 'react'
import { useTranslation } from "react-i18next";

import style from './CasthQutConfirmDialog.module.css'

import {ReactComponent as TickCircle} from './../../assets/TickCircle.svg'

  const CasthQutConfirmDialog = ({ amountBits, setOpenConfirm }) => {
    const { t } = useTranslation();

    return (
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
    )
  }


  export default CasthQutConfirmDialog;