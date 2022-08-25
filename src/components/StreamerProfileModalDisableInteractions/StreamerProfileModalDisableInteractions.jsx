import React from "react";

import style from "./StreamerProfileModalDisableInteractions.module.css";

const StreamerProfileModalDisableInteractions = ({setChecked, cerrarModal, setTitleCheckbox}) => {


    const handleOnClick = () =>{
        setChecked(false)
        cerrarModal(false)
        setTitleCheckbox('disabled')
    }

  return (

    <div className={style.containerModal}>
      <div className={style.content}>
        <div className={style.item}>
          <h2 className={style.title}>
            Disabling reactions hides the channel reward and overlay on your
            stream
          </h2>
          <p className={style.subTitle}>You can always turn them back on whenever you like ;) </p>
          <button onClick={handleOnClick} className={style.boton}>Disable reactions</button>
          <p className={style.p}>Don't disable</p>
        </div>
        <label className={style.label}> 
        <input type="checkbox"/>
        Don't show this message again </label>
      </div>
     </div>
  );
};

export default StreamerProfileModalDisableInteractions;
