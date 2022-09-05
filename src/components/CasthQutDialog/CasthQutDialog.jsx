import React from "react";

import style from "./CasthQutDialog.module.css";

import { ReactComponent as BitsIcon } from "./../../assets/BitsIcon.svg";

const CasthQutDialog = ({ setOpen, setOpenConfirm, setConfirmCashOut }) => {
  return (
    <div className={style.container_Dialog}>
      <div className={style.container}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <BitsIcon style={{ width: "35px", height: "35px" }} />
          <h1>250</h1>
        </div>
        <p className={style.calculated_Bit}>200 Qoins = 10 Bits</p>
        <p className={style.text}>
          Confirm you are cashing out your Qoins for Bits on Twitch
        </p>
        <button onClick={() => {setOpenConfirm(true); setConfirmCashOut(true)}} className={style.button_cash}>Cash Out</button>
        <button onClick={() => setOpen(false)} className={style.button_cancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CasthQutDialog;
