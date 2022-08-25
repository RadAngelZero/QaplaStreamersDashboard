 import React, { useState } from 'react';

 import style from './StreamerProfileImgCoin.module.css'

 import { Modal } from '@material-ui/core';

 import iconsCoin from '../../assets/channel-pts-twitch-icon@4x.png'

 import ModalQoinsDrops from '../ModalQoinsDrops/ModalQoinsDrops'

    const StreamerProfileImgCoin = ({inputCoint}) =>{
        const [modal, setModal] = useState(true);
       
        const abrirCerrarModal = () =>{
          setModal(!modal)
        }  

       return (
        <div className={style.container}>
           <img className={style.img} src={iconsCoin} alt={'icono'} />
           <p className={style.p}> {inputCoint}</p>
           <Modal className={style.modal} open={modal} onClose={abrirCerrarModal}>
              <ModalQoinsDrops/>
           </Modal>
        </div>
       )
    }


    export  default StreamerProfileImgCoin;