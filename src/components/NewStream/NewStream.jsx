import React, { useState, useReducer, useEffect } from 'react';
import { makeStyles, Grid, Button, InputAdornment, InputLabel, CircularProgress } from '@material-ui/core';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers'
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DayJsUtils from '@date-io/dayjs';

import { createNewStreamRequest, updateStreamerProfile } from './../../services/database';
import styles from './NewStream.module.css';
import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import BackButton from '../BackButton/BackButton';
import NewStreamSuccessDialog from './NewStreamSuccessDialog';
import { getTwitchUserDataCloudFunction } from '../../services/functions';
import { ReactSearchAutocomplete } from 'react-search-autocomplete';

const useStyles = makeStyles((theme) => ({
    label: {
        color: '#FFF',
        fontSize: '14px'
    },
    titleLabel: {
        marginBottom: 8
    },
    datePickerLabel: {
        marginBottom: theme.spacing(1),
        fontSize: '12px',
        color: '#B2B3BD',
        lineHeight: '16px',
        width:'274px'
    },
    button: {
        color: '#FFF',
        backgroundColor: '#6C5DD3',
        borderRadius: '1rem',
        padding: '1rem 3rem 1rem 3rem'
    },
    dateInput: {
        color: '#FFF',
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        fontWeight: 'bold',
        backgroundColor: '#141833',
        borderRadius: '.5rem',
        fontSize: '14px',
        height: '56px',
        '& .MuiInputAdornment-root': {
            width: '20px',
            marginLeft: '-6px',
            marginRight: '18px',
            zIndex: '10',
            height: '56px',
        }
    },
    popover: {
        backgroundColor: '#141833',
        color: 'white',
        padding: '15px',
        '& .MuiPickersCalendarHeader-switchHeader': {
            '& .MuiIconButton-root:hover': {
                backgroundColor: '#707070'
            }
        },
        '& .MuiPickersToolbar-toolbar': {
            borderRadius: '20px'
        },
        '& .MuiButtonBase-root:hover:not(.MuiPickersDay-daySelected)': {
            backgroundColor: '#3f51b5',
        },
        '& .MuiPickersDay-day': {
            color: 'white'
        },
        '& .MuiPickersDay-daySelected': {
            backgroundColor: '#00beff',
            color: '#000'
        },
        '& .MuiPickersDay-dayDisabled': {
            color: 'gray'
        },
        '& .MuiPickersCalendarHeader-dayLabel': {
            color: 'white'
        },
        '& .MuiPickersClockNumber-clockNumber': {
            color: 'white'
        },
        '& .MuiPickersClockPointer-pointer': {
            backgroundColor: '#00beff',
            '& .MuiPickersClockPointer-noPoint': {
                borderColor: '#00beff',
            },
            '& .MuiPickersClockPointer-thumb': {
                borderColor: '#00beff',
            }
        },
        '& .MuiPickersClockNumber-clockNumberSelected': {
            color: '#000'
        }
    },
    accordionContainer: {
        marginTop: '3%',
    },
    accordion: {
        backgroundColor: '#0D1021',
        width: '66%',
    },
    accordionGridRoot: {
        flex: 1,
        flexGrow: 2,
    },
    accordionGridItem: {
        flex: 1,
        flexGrow: 2,
    },
}));

const NewStream = ({ user, games, qoinsDrops }) => {
    const userLang = navigator.language || navigator.userLanguage;
    const classes = useStyles();
    const history = useHistory();
    const { t } = useTranslation();
    const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
    const [selectedGame, setSelectedGame] = useState();
    const [selectedEvent, setSelectedEvent] = useState('exp');
    const [stringDate, setStringDate] = useState('');
    const [clockOpen, setClockOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [gamesData, setGamesData] = useState([]);
    const [dropsForStream, setDropsForStream] = useState(qoinsDrops.left && qoinsDrops.left < 50 ? qoinsDrops.left : 50);
    const [lockSendButton, setLockSendButton] = useState(false);

    useEffect(() => {
        let gameList = [];

        if (games.allGames) {
            gameList = Object.keys(games.allGames).map((gameKey) => ({ gameKey, ...games.allGames[gameKey] }));

            let tempGamesData = [];
            gameList.forEach((game) => {
                tempGamesData.push({
                    id: game.gameKey,
                    name: game.gameName
                })
            });

            setGamesData(tempGamesData);
        }
    }, [games.allGames, user]);

    const optionalDataReducer = (state, action) => {
        // We don´t need this to be a reducer anymore, we should change it later
        switch (action.target.id) {
            case 'eventTitle':
                return ({
                    ...state,
                    title: action.target.value
                });
            default:
                break;
        }
    }

    const [optionalData, optionalDataDispatcher] = useReducer(optionalDataReducer, {});

    // Minimum valid date is 24 hours since the current date
    const minDate = new Date((new Date()).getTime() + 86400000);

    // The default date is the minDate + 15 minutes, to avoid show the error feedback when the streamer open the screen
    const [selectedDate, setSelectedDate] = useState(new Date(minDate.getTime() + 900000));
    const [displayDate, setDisplayDate] = useState(new Date(minDate.getTime() + 900000));

    const handleDateChange = (date) => {
        try {
            setSelectedDate(date.$d);

        } catch (e) { console.log(e) }

        setDisplayDate(date)
    };

    const setDrops = (drops) => {
        if (drops >= 0 && drops <= qoinsDrops.left) {
            setDropsForStream(drops);
        }
    }

    const submitEvent = async () => {
        setLockSendButton(true);
        if (user.broadcasterType === '') {
            setLockSendButton(false);
            return alert(t('NewStream.alerts.noChannelPoints'));
        }

        // User is not premium and don´t have a Free Trial
        if (user.premium === undefined && user.freeTrial === undefined) {
            return setLockSendButton(false);
        }

        if (selectedDate < minDate) {
            setLockSendButton(false);
            alert(t('NewStream.alerts.before24h'));
            return;
        }
        if (!selectedGame) {
            setLockSendButton(false);
            alert(t('NewStream.alerts.missingData'));
            return;
        }

        if (user.currentPeriod) {
            const { endDate } = user.currentPeriod;

            /**
             * Check if the selected date is valid to create the event based on the end of the streamer subscription
             */
            if (selectedDate.getTime() <= endDate) {

                const userCanCreateStream = qoinsDrops.original;

                /**
                 * If the number of streams in the selected period plus 1 (to count the event the streamer is trying to create)
                 * is lower or equal to the user limit per month then we create the event
                 */
                if (userCanCreateStream) {
                    const UTCDay = selectedDate.getUTCDate() < 10 ? `0${selectedDate.getUTCDate()}` : selectedDate.getUTCDate();
                    const UTCMonth = selectedDate.getUTCMonth() + 1 < 10 ? `0${selectedDate.getUTCMonth() + 1}` : selectedDate.getUTCMonth() + 1;
                    let UTCDate = `${UTCDay}-${UTCMonth}-${selectedDate.getUTCFullYear()}`;

                    const UTCHour = selectedDate.getUTCHours() < 10 ? `0${selectedDate.getUTCHours()}` : selectedDate.getUTCHours();
                    const UTCMinutes = selectedDate.getUTCMinutes() < 10 ? `0${selectedDate.getUTCMinutes()}` : selectedDate.getUTCMinutes();
                    let UTCTime = `${UTCHour}:${UTCMinutes}`;

                    let streamerData = {
                        displayName: user.displayName,
                        login: user.login,
                        photoUrl: user.photoUrl
                    };

                    const userData = await getTwitchUserDataCloudFunction(user.id);
                    if (userData && userData.data) {
                        streamerData = {
                            displayName: userData.data.display_name,
                            login: userData.data.login,
                            photoUrl: userData.data.profile_image_url
                        };

                        await updateStreamerProfile(user.uid, {
                            displayName: userData.data.display_name,
                            login: userData.data.login,
                            photoUrl: userData.data.profile_image_url,
                            broadcasterType: userData.data.broadcaster_type
                        });
                    }

                    await createNewStreamRequest(user.uid, streamerData, selectedGame, UTCDate, UTCTime, selectedEvent, selectedDate.getTime(), optionalData, (new Date()).getTime(), stringDate, dropsForStream);

                    window.analytics.track('Stream requested', {
                        selectedGame,
                        selectedDate: selectedDate.getTime(),
                        uid: user.uid
                    });
                    setOpenSuccessDialog(true);
                }
            } else {
                alert(t('NewStream.alerts.beforePlanExpiration'));
            }
        }
    }

    return (
        <StreamerDashboardContainer user={user}>
            <Grid container>
                <Grid item xs={12}>
                    <BackButton onClick={history.goBack} />
                </Grid>
                <Grid item sm={8}>
                    <h1 className={styles.title}>
                        {t('NewStream.whatAreYouPlaying')}
                    </h1>
                    <Grid container spacing={4} style={{width: '800px',marginTop: '2px' }}>
                        <Grid item sm={5} style={{ width: '274px', maxWidth: '308px', }}>
                            <InputLabel className={classes.datePickerLabel}>
                                {t('NewStream.pickACategory')}
                            </InputLabel>
                            <ReactSearchAutocomplete
                                items={gamesData}
                                autofocus
                                placeholder={t('NewStream.categoryPickerPlaceholder')}
                                showItemsOnFocus
                                maxResults={gamesData.length}
                                onSelect={(game) => setSelectedGame(game.id)}
                                onClear={() => setSelectedGame(null)}
                                styling={{
                                    zIndex: 999,
                                    height: '56px',
                                    width: '274px',
                                    color: '#FFF',
                                    hoverBackgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    backgroundColor: '#141833',
                                    border: 'none',
                                    borderRadius: '8px',
                                    placeholderColor: 'rgba(255, 255, 255, 0.5)',
                                    fontFamily: 'Inter',
                                    lineColor: 'transparent',
                                }}
                                showIcon={false}
                                formatResults={(item) => <span style={{ display: 'block', textAlign: 'left' }}>name: {item.name}</span>} />
                        </Grid>
                    </Grid>
                    <h1 className={styles.title}>
                        {t('NewStream.when')}
                    </h1>
                    <MuiPickersUtilsProvider utils={DayJsUtils}>
                        <Grid container spacing={4} style={{ marginTop: '2px' }}>
                            <Grid item sm={5} style={{ maxWidth: '304px', }}>
                                <InputLabel className={classes.datePickerLabel} >
                                    {t('NewStream.date')}
                                </InputLabel>
                                <KeyboardDatePicker
                                    open={calendarOpen}
                                    onClick={() => setCalendarOpen(true)}
                                    onOpen={() => { }}
                                    onClose={() => setCalendarOpen(false)}
                                    clearable
                                    disablePast
                                    disableToolbar
                                    autoOk
                                    value={displayDate}
                                    placeholder='10-10-2021'
                                    onChange={handleDateChange}
                                    defaultValue={new Date()}
                                    minDate={minDate}
                                    minDateMessage={t('NewStream.alerts.before24h')}
                                    format='DD-MM-YY ddd'
                                    style={{width:'274px', height:'56px'}}
                                    keyboardIcon={
                                        <InputAdornment position='end' >
                                            <CalendarIcon />
                                        </InputAdornment>
                                    }
                                    InputProps={{
                                        disableUnderline: true,
                                        className: classes.dateInput
                                    }}
                                    variant={'inline'}
                                    PopoverProps={{
                                        PaperProps: {
                                            className: classes.popover,
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item sm={5} style={{ maxWidth: '274px', }}>
                                <InputLabel className={classes.datePickerLabel}>
                                    {t('NewStream.time')}
                                </InputLabel>
                                <KeyboardTimePicker
                                    open={clockOpen}
                                    onClick={() => setClockOpen(true)}
                                    onOpen={() => { }}
                                    onClose={() => setClockOpen(false)}
                                    autoOk
                                    error={selectedDate <= minDate}
                                    helperText={selectedDate >= minDate ? '' : t('NewStream.alerts.before24h')}
                                    value={displayDate}
                                    placeholder='08:00 AM'
                                    onChange={handleDateChange}
                                    style={{width:'274px',height:'56px'}}
                                    // mask='__:__ _M'
                                    keyboardIcon={
                                        <InputAdornment position='end' >
                                            <TimeIcon />
                                        </InputAdornment>
                                    }
                                    InputProps={{
                                        disableUnderline: true,
                                        className: classes.dateInput
                                    }}
                                    variant={'inline'}
                                    PopoverProps={{
                                        PaperProps: {
                                            className: classes.popover,
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </MuiPickersUtilsProvider>
                    <Grid  spacing={4} style={{ marginTop: '2px' }}>
                        <Grid item sm={5}  style={{display: 'flex'}}>
                            <Grid >
                                <h1 className={styles.title}>
                                    {t('NewStream.streamTitle')}
                                    <span style={{ fontSize: 16 }}>
                                        {t('NewStream.optional')}
                                    </span>
                                </h1>
                                <p className={styles.subTitle}>
                                    {t('NewStream.streamTitleDescription')}
                                </p>
                                <Grid container spacing={4} style={{ marginTop:'10px'}}>
                                    <Grid item className={classes.accordionGridItem} style={{ marginTop: '10px'}}>
                                        <StreamerTextInput
                                            labelClassName={classes.titleLabel}
                                            label={t('NewStream.streamTitle')}
                                            placeholder={t('NewStream.streamTitlePlaceholder')}
                                            id='eventTitle'
                                            fullWidth={true}
                                            value={optionalData.title ? userLang.toLowerCase().includes('es') ? optionalData.title.es : optionalData.title.en : ''}
                                            onChange={(e) => optionalDataDispatcher({ target: e.target })}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid  style={{marginLeft:'30px'}}>
                                <h1 className={styles.title}>
                                    {t('NewStream.dropsTitle')}
                                </h1>
                                <p className={styles.subTitle}>
                                    {t('NewStream.dropsDescription')}
                                </p>
                                <Grid container spacing={4} style={{ marginTop:'10px'}}>
                                    <Grid item className={classes.accordionGridItem} style={{ marginTop: '10px'}}>
                                        <StreamerTextInput
                                            labelClassName={classes.titleLabel}
                                            label={t('NewStream.maxLimit')}
                                            id='eventTitle'
                                            fullWidth={true}
                                            value={dropsForStream}
                                            onChange={(e) => setDrops(Number(e.target.value))}
                                            type={'Number'}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Button
                        disabled={lockSendButton}
                        className={styles.button}
                        onClick={submitEvent}>
                        {lockSendButton ?
                            <CircularProgress
                                style={{
                                    color: '#fff7',
                                    alignSelf: 'center'
                                }}
                                size={25} />
                            :
                            t('NewStream.submit')
                        }
                    </Button>
                </Grid>
            </Grid>
            <NewStreamSuccessDialog
                open={openSuccessDialog}
                onClose={() => history.push('/profile')}
                mainPage={() => history.push('/profile')}
            />
        </StreamerDashboardContainer>
    );
}

export default NewStream;