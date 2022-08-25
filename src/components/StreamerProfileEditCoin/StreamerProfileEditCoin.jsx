import React, { useState } from "react";

import imgStreameCoin from "../../assets/streamerProfileCoin.jpg";
import iconEdit from "../../assets/Edit.svg";

import style from "./StreamerProfileEditCoin.module.css";

import StreamerProfileModalDisableInteractions from "../StreamerProfileModalDisableInteractions/StreamerProfileModalDisableInteractions";

import { Modal } from "@material-ui/core";

const StreamerProfileEditCoin = () => {
  const [ActiveEditTitle, setActiveEditTitle] = useState(false);
  const [ActiveEditCoins, setActiveEditCoins] = useState(false);
  const [modal, setModal] = useState(false);
  const [titleCheckbox, setTitleCheckbox] = useState("enabled");
  const [checked, setChecked] = useState(true);
  const [inputTitle, setInputTitle] = useState('Qapla Reaction')
  const [inputCoint, setinputCoint] = useState('2.000')

  const handleCheckbox = (e) => {
    if (!e.target.checked) {
      setModal(true);
      // setTitleCheckbox("disabled");
    } else {
      setChecked(true);
      setTitleCheckbox("enabled");
    }
  };

  const cerrarModal = (e) => {
    setModal(false);
  };

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
            value={inputTitle}
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
            value={inputCoint}
            autoFocus
          />
          <button onClick={() => setActiveEditCoins(!ActiveEditCoins)}>
            <img src={iconEdit} alt="icons-edit" />
          </button>
        </div>
        <div className={style.disableInteractions}>
          <p className={style.p}>Reactions {titleCheckbox}</p>
          <input
            className={style.input_checkbox}
            type="checkbox"
            id="boton"
            checked={checked}
            onChange={(e) => handleCheckbox(e)}
          />
          <label for="boton"></label>
        </div>
      </div>
      <Modal
        className={style.modalContainer}
        open={modal}
        onClose={cerrarModal}
      >
        <StreamerProfileModalDisableInteractions cerrarModal={cerrarModal}  setChecked={setChecked} setTitleCheckbox={setTitleCheckbox}/>
      </Modal>
    </div>
  );
};

export default StreamerProfileEditCoin;
