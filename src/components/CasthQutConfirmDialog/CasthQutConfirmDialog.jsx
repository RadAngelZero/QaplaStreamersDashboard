import React from 'react'

import style from './CasthQutConfirmDialog.module.css'

import {ReactComponent as TickCircle} from './../../assets/TickCircle.svg'

  const CasthQutConfirmDialog = ({setOpenConfirm}) => {
    return (
        <div style={{ width: '347px', height: '384px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <div className={style.container}> 
            <TickCircle className={style.tick}/>
            <p>We got your request! We'll send you 250 bits on your next stream</p>
            <button onClick={() =>setOpenConfirm(false)}>Go to Dashboard</button>
            </div>
        </div>
    )
  }


  export default CasthQutConfirmDialog;