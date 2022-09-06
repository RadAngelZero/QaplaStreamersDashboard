import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import style from "./CasthQutDialog.module.css";

import { ReactComponent as BitsIcon } from "./../../assets/BitsIcon.svg";
import { notifyCashOutToQaplaAdmin } from "../../services/discord";
import { saveStreamerCashOutRequest } from "../../services/database";

const CasthQutDialog = ({ user, setOpen, setOpenConfirm, setConfirmCashOut, amountBits }) => {
  const [bits, setBits] = useState(0);
  const [disableButton, setDisableButton] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (amountBits > 0 && !bits) {
      setBits(amountBits);
    }
  }, [amountBits]);

  const confirmCashOut = async () => {
    const qoinsCashOut = amountBits / 10 * 200;

    setDisableButton(true);
    await saveStreamerCashOutRequest(user.uid, qoinsCashOut, amountBits);
    await notifyCashOutToQaplaAdmin(user.uid, user.displayName, qoinsCashOut, amountBits);
    setOpenConfirm(true);
    setConfirmCashOut(true);
    setDisableButton(false);
  }

  return (
    <div className={style.container_Dialog}>
      <div className={style.container}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <BitsIcon style={{ width: "35px", height: "35px" }} />
          <h1>
            {bits.toLocaleString()}
          </h1>
        </div>
        <p className={style.calculated_Bit}>200 Qoins = 10 Bits</p>
        <p className={style.text}>
          {t('StreamerProfile.BarProgressBit.confirmCashOut')}
        </p>
        <button disabled={disableButton} onClick={confirmCashOut} className={style.button_cash}>
          {t('StreamerProfile.BarProgressBit.cashOut')}
        </button>
        <button onClick={() => setOpen(false)} className={style.button_cancel}>
          {t('StreamerProfile.BarProgressBit.cancel')}
        </button>
      </div>
    </div>
  );
};

export default CasthQutDialog;
