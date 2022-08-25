import React from "react";

import style from "./ModalQoinsDrops.module.css";

const ModalQoinsDrops = () => {
  return (
    <div className={style.containerModal}>
      <div className={style.container}>
        <div className={style.secctions_input}>
          <div className={style.titulo}>
            <h1>🪂 Qoins' Drops</h1>
            <p>
              Set a time for the Qoins' channel reward to show on yor stream
            </p>
          </div>
          <div className={style.content_input}>
            <label>
              <input type="checkbox" />
              Right away
            </label>

            <label>
              <input type="checkbox" />
              in 30 min
            </label>

            <label>
              <input type="checkbox" />
              in 45 min
            </label>

            <label>
              <input type="checkbox" />
              in 1 hour
            </label>
          </div>
          <button className={style.button}>Enable Drops</button>
        </div>
        <div className={style.secctions_text}>
          <div className={style.Titulo_secction_text}>
            <h1>💬 Send text to followers</h1>
            <p>
              avisa a tu gente algo relevante sobre tu stream, crea hype o lo
              que tu quieras! Tus seguidores reciben una notificacion movil con
              tu mensaje.
            </p>
          </div>
          <input className={style.input_grande} type="text" />
          <div className={style.contenedor_boton}>
            <button>Send</button>
          </div>
        </div>
      </div>

      <p className={style.extraData}>Exploring Astraland 🌙 /30 Apri/10:30 p.m.</p>
    </div>
  );
};

export default ModalQoinsDrops;
