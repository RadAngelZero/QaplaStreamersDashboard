import React, { useState } from 'react';
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
    const classes = useStyles();
    const { t } = useTranslation();

    const onLanguageChanged = (languageCode) => {
        changeLanguage(languageCode.target.value);
        setCurrentLanguageCode(languageCode.target.value);
    }

    return (
        <>
            <TranslateIcon />
            {/* The style of this select needs to be implemented inline */}
            <StreamerSelect style={{ marginRight: 8, backgroundColor: 'transparent' }} value={currentLanguageCode} onChange={onLanguageChanged} Icon={ArrowIcon}>
                {getAvailableLanguages().map((languageCode) => (
                    <option className={classes.languageLabel} value={languageCode}>
                        {t(`LanguageHandler.languages.${languageCode}`)}
                    </option>
                ))}
            </StreamerSelect>
        </>
    );
}

export default LanguageSelect;