import React, { useState } from "react";
import imgStreameCoin from "../../assets/streamerProfileCoin.jpg";
import style from "./StreamerProfileEditCoin.module.css";
import iconEdit from "../../assets/Edit.svg";
const StreamerProfileEditCoin = () => {
  const [ActiveEditTitle, setActiveEditTitle] = useState(false);
  const [ActiveEditCoins, setActiveEditCoins] = useState(false);
  return (
    <div className={style.containerItereractions}>
      <h1 className={style.Titulo}>Reactions</h1>
      <img className={style.img} src={imgStreameCoin} alt="coin" />
      <div className={style.content_input}>
        <div className={style.input}>
          <p className={style.p}>Qapla Reaction</p>
          <input
            className={
              ActiveEditTitle ? style.Visibility_input : style.Desabilite_input
            }
            type="text"
            maxlength="18"
            autoFocus
          />
          <button onClick={() => setActiveEditTitle(!ActiveEditTitle)}>
            <img src={iconEdit} alt="icons-edit" />
          </button>
        </div>
        <div className={style.input}>
          <p className={style.p}>2.000</p>
          <input
            className={
              ActiveEditCoins ? style.Visibility_input : style.Desabilite_input
            }
            type="number"
            autoFocus
          />
          <button onClick={() => setActiveEditCoins(!ActiveEditCoins)}>
            <img src={iconEdit} alt="icons-edit" />
          </button>
        </div>
        <div className={style.disableInteractions}>
          <p className={style.p}>Reactions enabled</p>
          <input type="checkbox" id="boton" />
          <label for="boton"></label>
        </div>
      </div>
    </div>
  );
};

export default StreamerProfileEditCoin;
