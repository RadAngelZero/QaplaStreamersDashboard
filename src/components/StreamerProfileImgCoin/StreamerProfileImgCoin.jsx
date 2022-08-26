import React from 'react';

import style from './StreamerProfileImgCoin.module.css'
import iconsCoin from '../../assets/channel-pts-twitch-icon@4x.png'

const StreamerProfileImgCoin = ({ rewardCost = 0, backgroundColor }) =>{
   return (
      <div className={style.container} style={{ backgroundColor }}>
         <img className={style.img} src={iconsCoin} alt={'icono'} />
         <p className={style.p}> {rewardCost.toLocaleString()}</p>
      </div>
   );
}

export  default StreamerProfileImgCoin;