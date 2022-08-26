 import React from 'react';

 import style from './StreamerProfileImgCoin.module.css'

 import iconsCoin from '../../assets/channel-pts-twitch-icon@4x.png'

    const StreamerProfileImgCoin = ({inputCoint}) =>{

       return (
        <div className={style.container}>
           <img className={style.img} src={iconsCoin} alt={'icono'} />
           <p className={style.p}> {inputCoint}</p>
        </div>
       )
    }


    export  default StreamerProfileImgCoin;