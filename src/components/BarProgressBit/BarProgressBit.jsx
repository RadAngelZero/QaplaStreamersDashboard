import React from 'react';

import style from './BarProgressBit.module.css'

import { withStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';


const BorderLinearProgress = withStyles((theme) => ({
    root: {
      height: 10,
      borderRadius: 5,
      backgroundColor: '#0D1021'
    },
    bar: {
      borderRadius: 5,
      background: 'linear-gradient(270deg, #4FF4FF 0%, #924FFF 52.52%, #FF8ADE 100%), #0AFFD2;',
    },
  }))(LinearProgress);

  const BarProgressBit = () => {

    return (
        <div className={style.container}>
         <div className={style.barProgress}>
            <div className={style.titulos}> 
            <p className={style.titulo_Porcentaje}>Next Milestone</p>
            <p className={style.porcentaje}>394 / 400</p>
            </div>
            <BorderLinearProgress variant="determinate" value={1} />
         </div>
         <div className={style.puntos}>
            <p>Available</p>
            <h2>250</h2>
         </div>
         <button className={style.button}>Cash Qut</button>
        </div>
    )
  }


  export default BarProgressBit;