import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { changeLanguage, getAvailableLanguages, getCurrentLanguage } from '../../utilities/i18n';
import { ReactComponent as TranslateIcon } from './../../assets/Translate.svg';
import { ReactComponent as ArrowIcon } from './../../assets/Arrow.svg';
import StreamerSelect from '../StreamerSelect/StreamerSelect';

const useStyles = makeStyles(() => ({
    languageLabel: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 600
    }
}));

const LanguageSelect = () => {
    const [currentLanguageCode, setCurrentLanguageCode] = useState(getCurrentLanguage());
    const [langData, setLangData] = useState([])
    const classes = useStyles();
    const { t } = useTranslation();

    useEffect(() => {
        let tempLangArr = []
        getAvailableLanguages().map((languageCode) => (
            tempLangArr.push({
                value: languageCode,
                label: t(`LanguageHandler.languages.${languageCode}`)
            })
        ))
        setLangData(tempLangArr)
    }, [t])

    const onLanguageChanged = (languageCode) => {
        changeLanguage(languageCode);
        setCurrentLanguageCode(languageCode);
    }

    return (
        <div style={{
            display: 'flex'
        }}>
            <TranslateIcon style={{
                display: 'flex'
            }} />
            {/* The style of this select needs to be implemented inline */}
            <div style={{
                marginTop: '-10px',
            }}>
                <StreamerSelect
                    style={{ backgroundColor: '#141833' }}
                    data={langData}
                    value={currentLanguageCode}
                    onChange={onLanguageChanged}
                    overflowY='hidden'
                    overflowX='hidden'
                />
            </div>
        </div>
    );
}

export default LanguageSelect;