import React, { useState }  from "react";
import { Button, Checkbox, makeStyles } from "@material-ui/core";

import style from "./StreamerProfileModalDisableInteractions.module.css";
import { ReactComponent as Unchecked } from './../../assets/Unchecked.svg';
import { ReactComponent as Checked } from './../../assets/Checked.svg';

const useStyles = makeStyles((theme) => ({
    disableButtonRoot: {
        marginTop: 16,
        backgroundColor: '#3B4BF9',
        width: '200px',
        height: '56px',
        borderRadius: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '0px',
        color: '#FFF',
        textTransform: 'none',
        '&:hover': {
            background: '#2E3AC1',
        },
        '&:active': {
            background: '#2E3AC1',
            opacity: '0.9'
        }
    },
    dontDisableButtonRoot: {
        paddingTop: 0,
        paddingBottom: 0,
        backgroundColor: '#0000',
        width: '200px',
        height: '56px',
        borderRadius: '16px',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        letterSpacing: '0.49px',
        color: '#3B4BF9',
        textTransform: 'none',
    },
    notShowAgainTextButton: {
        fontSize: '10px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '16px',
        letterSpacing: '0em',
        textTransform: 'none'
    }
}));

const StreamerProfileModalDisableInteractions = ({ disableReward, closeDialog, setTitleCheckbox }) => {
    const [notShowEndStreamAgain, setNotShowEndStreamAgain] = useState(false);
    const classes = useStyles();

    const notShowAgainHandler = () => {
        setNotShowEndStreamAgain(!notShowEndStreamAgain);
    }

    const disableReactions = () => {
        if (notShowEndStreamAgain) {
            localStorage.setItem('dontShowCloseDisableReactionsDialog', 'true');
        }

        disableReward();
        setTitleCheckbox('disabled');
        closeDialog();
    }

    return (
        <div className={style.containerModal}>
            <div className={style.content}>
                <div className={style.item}>
                    <h2 className={style.title}>
                        Disabling reactions hides the channel reward and overlay on your stream
                    </h2>
                    <p className={style.subTitle}>You can always turn them back on whenever you like ;)</p>
                    <Button onClick={disableReactions}
                        classes={{
                            root: classes.disableButtonRoot
                        }}>
                        Disable reactions
                    </Button>
                    <Button onClick={closeDialog}
                        classes={{
                            root: classes.dontDisableButtonRoot
                        }}>
                        Don't disable
                    </Button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <Checkbox
                    icon={<Unchecked />}
                    checkedIcon={<Checked />}
                    onChange={notShowAgainHandler}
                    checked={notShowEndStreamAgain}
                    style={{ paddingRight: '0px' }} />
                    <Button
                        classes={{
                            label: classes.notShowAgainTextButton
                        }}
                        disableRipple
                        style={{ color: notShowEndStreamAgain ? '#fff' : 'darkgrey', paddingLeft: '6px' }}
                        className={style.label}
                        onClick={notShowAgainHandler}>
                        Don't show this message again
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default StreamerProfileModalDisableInteractions;
