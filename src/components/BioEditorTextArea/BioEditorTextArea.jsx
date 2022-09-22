import React, { useRef } from 'react';
import { makeStyles, TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

// Uncomment when uncomment JSX using this icons
/* import { ReactComponent as BoldIcon } from './../../assets/textFormatting/bold.svg';
import { ReactComponent as ItalicIcon } from './../../assets/textFormatting/italic.svg';
import { ReactComponent as UnderlineIcon } from './../../assets/textFormatting/underline.svg';
import { ReactComponent as StrikethroughIcon } from './../../assets/textFormatting/strikeThrough.svg';
import { ReactComponent as EmojiIcon } from './../../assets/textFormatting/smile.svg';
import { ReactComponent as UnorderedListIcon } from './../../assets/textFormatting/unorderedList.svg';
import { ReactComponent as OrderedListIcon } from './../../assets/textFormatting/orderedList.svg'; */
import { MAX_ROWS_IN_BIO } from '../../utilities/Constants';

const TEXT_INPUT_LINE_HEIGHT = 22;

const useStyles = makeStyles((theme) => ({
    container: {
        backgroundColor: '#202750',
        borderRadius: 15,
        width: '90%',
        marginTop: '32px',
        overflow: 'hidden',
        alignSelf: 'center',
        height: '218px',
    },
    buttonsContainer: {
        display: 'flex',
        height: '46px',
        width: '100%'
    },
    textInputContainer: {
        fontSize: 12,
        letterSpacing: .49,
        fontWeight: '400',
        backgroundColor: '#202750',
        paddingLeft: '16px',
        paddingRight: '24px',
        paddingTop: 16,
        lineHeight: `${TEXT_INPUT_LINE_HEIGHT}px`,
        marginTop: 0,
        color: '#FFF',
        borderRadius: '0px 0px 15px 15px'
    },
    textInput: {
        lineHeight: 22
    },
    iconButton: {
        backgroundColor: '#232A54',
        flex: 1,
        color: '#FFF',
        minWidth: 'auto',
        height: '100%',
        border: 'none',
        margin: 0,
        '&:hover': {
            backgroundColor: '#24456680',
            boxShadow: 'none'
        },
        '&:disabled': {
            backgroundColor: '#272D5780',
            color: '#FFF',
        },
        '&:active': {
            backgroundColor: '#57758C',
            boxShadow: 'none'
        },
        '&:visited': {
            backgroundColor: '#57758C',
            boxShadow: 'none'
        }
    },
    minLengthIndicator: {
        marginTop: 8,
        fontSize: 10,
        fontWeight: '400',
        width: '90%',
        color: '#FFF',
        opacity: .6,
        display: 'flex',
        justifyContent: 'flex-end'
    }
}));

/* const FormattingButton = withStyles(() => ({
    root: {
        display: 'flex',
        flex: 1,
        backgroundColor: '#232A54',
        color: '#FFF',
        minWidth: 'auto',
        border: 'none',
        '&:hover': {
            backgroundColor: '#24456680'
        },
        '&:disabled': {
            backgroundColor: '#272D5780',
            color: '#FFFFFF99',
        },
    },
}))(Button); */

const BioEditorTextArea = ({ bio, setBio, error, minLength }) => {
    let textAreaRef = useRef(null);
    /* const [bold, setBold] = useState(false);
    const [italic, setItalic] = useState(false);
    const [underline, setUnderline] = useState(false);
    const [strikeThrough, setStrikeThrough] = useState(false);
    const [emoji, setEmoji] = useState(false);
    const [unorderedList, setUnorderedList] = useState(false);
    const [orderedList, setOrderedList] = useState(false); */
    const classes = useStyles();
    const { t } = useTranslation();

    /* const toggleBold = (e) => {
        setBold(!bold);
    }

    const toggleItalic = () => {
        setItalic(!italic);
    }

    const toggleUnderline = () => {
        setUnderline(!underline);
    }

    const toggleStrikeThrough = () => {
        setStrikeThrough(!strikeThrough);
    }

    const toggleEmoji = () => {
        setEmoji(!emoji);
    }

    const toggleUnorderedList = () => {
        setUnorderedList(!unorderedList);
    }

    const toggleOrderedList = () => {
        setOrderedList(!orderedList);
    } */

    const updateBio = (e) => {
        const updatedBio = e.target.value;
        const numberOfLines = Math.floor(textAreaRef.current.scrollHeight / TEXT_INPUT_LINE_HEIGHT);

        if (updatedBio[0] !== '\n') {
            if (updatedBio.split('\n').length <= MAX_ROWS_IN_BIO && numberOfLines <= MAX_ROWS_IN_BIO) {
                setBio(updatedBio);
            } else if (updatedBio.length < bio.length) {
                setBio(updatedBio);
            }
        }
    }

    return (
        <>
        <div className={classes.container} style={error ? { border: '1px solid #FF0000', borderRadius: '15px 15px 15px 15px' } : {}}>
            {/* Currently we don´t have support for text edition */}
            {/* <div className={classes.buttonsContainer}>
                <FormattingButton onClick={toggleBold}>
                    <div style={{ backgroundColor: bold ? '#57758c' : '#0000' }} className={classes.buttonActive}>
                        <BoldIcon />
                    </div>
                </FormattingButton>
                <FormattingButton onClick={toggleItalic}>
                    <div style={{ backgroundColor: italic ? '#57758c' : '#0000' }} className={classes.buttonActive}>
                        <ItalicIcon />
                    </div>
                </FormattingButton>
                <FormattingButton onClick={toggleUnderline}>
                    <div style={{ backgroundColor: underline ? '#57758c' : '#0000' }} className={classes.buttonActive}>
                        <UnderlineIcon />
                    </div>
                </FormattingButton>
                <FormattingButton onClick={toggleStrikeThrough}>
                    <div style={{ backgroundColor: strikeThrough ? '#57758c' : '#0000' }} className={classes.buttonActive}>
                        <StrikethroughIcon />
                    </div>
                </FormattingButton>
                <FormattingButton onClick={toggleEmoji}>
                    <div style={{ backgroundColor: emoji ? '#57758c' : '#0000' }} className={classes.buttonActive}>
                        <EmojiIcon />
                    </div>
                </FormattingButton>
                <FormattingButton onClick={toggleUnorderedList}>
                    <div style={{ backgroundColor: unorderedList ? '#57758c' : '#0000' }} className={classes.buttonActive}>
                        <UnorderedListIcon />
                    </div>
                </FormattingButton>
                <FormattingButton onClick={toggleOrderedList}>
                    <div style={{ backgroundColor: orderedList ? '#57758c' : '#0000' }} className={classes.buttonActive}>
                        <OrderedListIcon />
                    </div>
                </FormattingButton>
            </div> */}
            <TextField multiline
                maxRows={MAX_ROWS_IN_BIO}
                rows={MAX_ROWS_IN_BIO}
                value={bio}
                onChange={updateBio}
                InputProps={{ disableUnderline: true, className: classes.textInputContainer }}
                fullWidth
                inputRef={textAreaRef} />
        </div>
        <p className={classes.minLengthIndicator}>
            {t('StreamerProfileEditor.OnBoarding.minChars')}
            <p style={{ marginLeft: 2, color: bio.length >= minLength ? '#51a05e' : '#FF0000' }}>
                {bio.length}/{minLength}
            </p>
        </p>
        </>
    );
}

export default BioEditorTextArea;