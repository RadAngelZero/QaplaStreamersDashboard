import React, { useState, useEffect } from "react";
import { CircularProgress, makeStyles } from "@material-ui/core";

import imgStreameCoin from "../../assets/streamerProfileCoin.jpg";
import style from "./StreamerProfileEditCoin.module.css";
import iconEdit from "../../assets/Edit.svg";
import { getCustomReward } from "../../services/twitch";
import { getInteractionsRewardData, updateStreamerProfile } from "../../services/database";
import { refreshUserAccessToken } from "../../services/functions";

const useStyles = makeStyles((theme) => ({
    circularProgress: {
        color: '#0AFFD2',
        alignSelf: 'center'
    }
}));

const StreamerProfileEditCoin = ({ user }) => {
    const [ActiveEditTitle, setActiveEditTitle] = useState(false);
    const [ActiveEditCoins, setActiveEditCoins] = useState(false);
    const [rewardName, setRewardName] = useState('');
    const [rewardCost, setRewardCost] = useState(0);
    const classes = useStyles();

    useEffect(() => {
        async function getRewardData() {
            const rewardData = await getInteractionsRewardData(user.uid);
            if (rewardData.exists()) {
                console.log(user.refreshToken);
                const userTokensUpdated = await refreshUserAccessToken(user.refreshToken);

                if (userTokensUpdated.data.status === 200) {
                    const userCredentialsUpdated = userTokensUpdated.data;
                    updateStreamerProfile(user.uid, { twitchAccessToken: userCredentialsUpdated.access_token, refreshToken: userCredentialsUpdated.refresh_token });
                    const reward = await getCustomReward(rewardData.val().rewardId, user.id, userCredentialsUpdated.access_token);
                    if (reward) {
                        setRewardName(reward.title);
                        setRewardCost(reward.cost);
                    }
                }
            }
        }

        getRewardData();
    }, []);

    return (
        <div className={style.containerItereractions}>
            <h1 className={style.Titulo}>Reactions</h1>
            {(rewardName && rewardCost)?
                <>
                <img className={style.img} src={imgStreameCoin} alt="coin" />
                <div className={style.content_input}>
                    <div className={style.input}>
                        {ActiveEditTitle ?
                            <input
                                className={style.Visibility_input}
                                type="text"
                                maxlength="18"
                                autoFocus />
                            :
                            <p className={style.p}>
                                {rewardName}
                            </p>
                        }
                        <button onClick={() => setActiveEditTitle(!ActiveEditTitle)}>
                            <img src={iconEdit} alt="icons-edit" />
                        </button>
                    </div>
                    <div className={style.input}>
                        {ActiveEditCoins ?
                            <input
                                className={style.Visibility_input}
                                type="number"
                                autoFocus
                            />
                            :
                            <p className={style.p}>
                                {rewardCost.toLocaleString()}
                            </p>
                        }
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
                </>
            :
                <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
                    <CircularProgress className={classes.circularProgress} size={25} />
                </div>
            }
        </div>
    );
};

export default StreamerProfileEditCoin;
