import React, { useState } from 'react';
import styles from "./Activity.module.css";
import { Tooltip } from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";

import { notationConvertion } from '../../utilities/functions';
import { BITS_DONATION, QOIN, ZAP } from '../../utilities/Constants';

import { ReactComponent as BitsIconBright } from './../../assets/Bits.svg';
import { ReactComponent as Zap } from './../../assets/Zap.svg';
import { ReactComponent as DonatedQoin } from './../../assets/DonatedQoin.svg';

import { ReactComponent as Refresh } from './../../assets/ActivityFeed/Refresh.svg';
import { ReactComponent as Deny } from './../../assets/ActivityFeed/Deny.svg';
import { ReactComponent as Clock } from './../../assets/ActivityFeed/Clock.svg';
import { ReactComponent as DownArrow } from './../../assets/ActivityFeed/DownArrow.svg';

import { ReactComponent as Tier } from './../../assets/ActivityFeed/Tier.svg';
import { ReactComponent as Chat } from './../../assets/ActivityFeed/Chat.svg';
import { ReactComponent as Calendar } from './../../assets/ActivityFeed/Calendar.svg';
import { ReactComponent as ClockDark } from './../../assets/ActivityFeed/ClockDark.svg';
import { ReactComponent as Sticker } from './../../assets/ActivityFeed/Sticker.svg';

const ActionsTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#131313',
        maxWidth: 256,
        border: '1px solid #4A4A4A',
        top: '-5px'
    },
    arrow: {

    },
}))(Tooltip);

const Activity = ({
    data,
    index,
    selectedIndex,
    onActivityOpen,
}) => {
    const date = new Date(data.data.timestamp * 1000);

    const banMemeHandler = () => {
        console.log('ban hammer');
    }

    return (
        <div className={styles.activityContainer} style={{
            backgroundColor: index % 2 ? '#0000' : '#141735',
            height: index === selectedIndex ? '256px' : '65px',
            padding: index === selectedIndex ? '16px 24px 40px 24px' : '16px 24px',
        }}>
            <div className={styles.activityRowContainer}>
                <div className={styles.activityUserContainer}>
                    <img className={styles.activityUserImg} src={data.user.imgURL} alt={'User'} />
                    <p className={styles.activityUserDispName}>{data.user.displayName}</p>
                </div>
                <div className={styles.activityAmountContainer}>
                    <p className={styles.activityAmountText} >{notationConvertion(data.cost.amount)}</p>
                    {data.cost.type === BITS_DONATION &&
                        <BitsIconBright style={{ width: '16px', height: '16px' }} />
                    }
                    {data.cost.type === ZAP &&
                        <Zap style={{ width: '16px', height: '16px' }} />
                    }
                    {data.cost.type === QOIN &&
                        <DonatedQoin style={{ width: '16px', height: '16px' }} />
                    }
                </div>
                <div className={styles.activityFeedActionButtonsContainer}>
                    <div className={styles.activityFeedActionButton}>
                        <Refresh />
                    </div>
                    <div className={styles.activityFeedActionButton}>
                        <Deny />
                    </div>
                    <ActionsTooltip placement='bottom-start' arrow title={
                        <React.Fragment>
                            <p>pe causa</p>
                        </React.Fragment>
                    } >
                        <div className={styles.activityFeedActionButton}>
                            <Clock />
                        </div>
                    </ActionsTooltip>
                    <div className={styles.activityFeedActionButton} onClick={() => onActivityOpen(index)}>
                        <DownArrow style={{
                            transform: index === selectedIndex ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'all 0.5s ease-out 0s',
                        }} />
                    </div>
                </div>
            </div>
            <div className={styles.activityRowContainer} style={{ marginTop: '38px', height: '160px' }}>
                {data.data.media.url &&
                    <div className={styles.mediaContainer}>
                        <div className={styles.mediaAttributionContainer}>
                            <img className={styles.mediaAttributionImage} src={data.data.media.uploader.avatarImg} alt='horneador' />
                            <p className={styles.mediaAttributionText}>{data.data.media.uploader.username}</p>
                        </div>
                        <img className={styles.media} src={data.data.media.url} alt='memingo' />
                    </div>
                }
                <div className={styles.dataContainer}>
                    <div className={styles.dataDisplayContainer}>
                        <Tier />
                        <p className={styles.dataText}>{`Tier ${data.data.tier}`}</p>
                    </div>
                    <div className={styles.dataDisplayContainer}>
                        <Chat />
                        <p className={styles.dataText} style={{
                            maxWidth: '308px',
                            maxHeight: '48px',
                            overflow: 'hidden',
                        }}>{data.data.message}</p>
                    </div>
                    <div className={styles.dataDisplayInRow}>
                        <div className={styles.dataDisplayContainer}>
                            <Calendar />
                            <p className={styles.dataText}>{`${date.getMonth().toString().length === 1 ? '0' : ''}${date.getMonth() + 1}-${date.getDate().toString().length === 1 ? '0' : ''}${date.getDate()}-${date.getFullYear().toString().slice(2)}`}</p>
                        </div>
                        <div className={styles.dataDisplayContainer}>
                            <Clock />
                            <p className={styles.dataText}>{`${date.getMonth().toString().length === 1 ? '0' : ''}${date.getMonth() + 1}-${date.getDate().toString().length === 1 ? '0' : ''}${date.getDate()}-${date.getFullYear().toString().slice(2)}`}</p>
                        </div>
                        <div className={styles.dataDisplayContainer}>
                            <Sticker />
                            {data.data.stickers.length > 0 ?
                                <div className={styles.stickersContainer}>
                                    {data.data.stickers.map((sticker) => {
                                        return (
                                            <img className={styles.sticker} src={sticker} alt='sticker' />
                                        )
                                    })}
                                </div>
                                :
                                <p className={styles.dataText}>{`n/a`}</p>
                            }
                        </div>
                    </div>
                </div>
                <div className={styles.banButton} onClick={banMemeHandler}>
                    <Deny style={{ width: '12px', height: '12px' }} />
                    <p className={styles.banButtonText}>{`Ban Meme`}</p>
                </div>
            </div>

        </div >
    );
}

export default Activity;