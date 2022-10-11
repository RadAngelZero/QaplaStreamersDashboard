import React, { useState, useEffect } from 'react';
import {
    makeStyles,
    Grid,
    TableCell,
    withStyles,
    InputLabel,
    InputAdornment,
    Button
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useParams, useLocation } from 'react-router-dom';
import { MuiPickersUtilsProvider, KeyboardDatePicker, KeyboardTimePicker } from '@material-ui/pickers'
import DayJsUtils from '@date-io/dayjs';
import { useTranslation } from 'react-i18next'

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import BackButton from '../BackButton/BackButton';
import { SCHEDULED_EVENT_TYPE, PAST_STREAMS_EVENT_TYPE } from '../../utilities/Constants';
import { loadApprovedStreamTimeStamp, getStreamParticipantsList, getStreamTitle, getPastStreamTitle, updateStreamDate, cancelStreamRequest, updateStreamTitle } from '../../services/database';
import { notifyAboutStreamToFollowersAndParticipants } from '../../services/functions';
import { notifyUpdateToQaplaAdmins } from '../../services/discord';
import EventConfirmCancellationDialog from '../QaplaStreamDialogs/EventConfirmCancellationDialog';
import SuccessDialog from '../SuccessDialog/SuccessDialog';

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: '24px',
        color: '#FFF'
    },
    description: {
        height: '30px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.60)',
        lineHeight: '18px',
        paddingRight: '16px',
        marginTop: '8px'
    },
    datePickerLabel: {
        fontSize: '12px',
        color: '#B2B3BD',
        lineHeight: '16px'
    },
    button: {
        marginTop: '32px',
        backgroundColor: '#3B4BF9',
        boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)',
        borderRadius: '16px',
        color: '#FFF',
        padding: '18px 0px',
        fontSize: '14px',
        fontWeight: '600',
        width: '166px',
        textTransform: 'none',
        '&:disabled': {
            opacity: .4,
            color: '#FFF',
            padding: '18px 0px',
            fontSize: '14px',
            fontWeight: '600',
            width: '166px',
            boxShadow: 'none',
        },
        '&:hover': {
            backgroundColor: '#3B4BF9',
            opacity: .9
        }
    },
    cancelButton: {
        marginBottom: '32px',
        backgroundColor: '#FF006B',
        borderRadius: '16px',
        color: '#FFF',
        padding: '18px 0px',
        fontSize: '14px',
        fontWeight: '600',
        width: '166px',
        textTransform: 'none',
        '&:disabled': {
            opacity: .4,
            color: '#FFF',
            padding: '18px 0px',
            fontSize: '14px',
            fontWeight: '600',
            width: '166px',
        },
        '&:hover': {
            backgroundColor: '#FF006B',
            opacity: .9
        }
    },
    containerTextArea: {
        width: '100%'
    },
    textArea: {
        minHeight: '100px',
        fontSize: '13px',
        fontWeight: '700'
    },
    tableHead: {
        fontSize: '16px !important',
        color: '#808191 !important',
        fontWeight: 'bold'
    },
    participantsColumn: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    tableRow: {
        backgroundColor: 'rgba(20, 24, 51, .5)'
    },
    tableRowOdd: {
        backgroundColor: 'transparent'
    },
    firstCell: {
        borderRadius: '1rem 0 0 1rem',
    },
    lastCell: {
        borderRadius: '0 1rem 1rem 0',
    },
    avatar: {
        width: theme.spacing(3),
        height: theme.spacing(3),
        marginLeft: '.25rem'
    },
    tableContainer: {
        marginBottom: 16
    },
    dateInput: {
        width: '274px',
        height: '56px',
        color: '#FFF',
        marginTop: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        fontWeight: 'bold',
        backgroundColor: '#141833',
        borderRadius: '.5rem',
        fontSize: '14px',
        '& .MuiInputAdornment-root': {
            width: '20px',
            marginLeft: '-6px',
            marginRight: '18px',
            zIndex: '10'
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
    }
}));

const TableCellStyled = withStyles(() => ({
    root: {
        borderColor: 'transparent',
        paddingTop: '1rem',
        paddingBottom: '1rem',
        fontSize: '14px',
        color: '#FFFFFF'
    }
}))(TableCell);

const SectionHeader = ({ title, description }) => {
    const classes = useStyles();

    return (
        <div style={{ marginTop: '48px' }}>
            <p className={classes.title}>
                {title}
            </p>
            <p className={classes.description}>
                {description}
            </p>
        </div>
    );
};

const EditStreamerEvent = ({ user }) => {
    const { streamType } = useLocation().state;
    const { streamId } = useParams();
    const [title, setTitle] = useState({ en: '', es: '' });
    const [selectedDate, setSelectedDate] = useState(new Date(1655251661000));
    const [displayDate, setDisplayDate] = useState(new Date(1655251661000))
    const [firstTimestamp, setFirstTimestamp] = useState(new Date(1655251661000))
    const [notificationBody, setNotificationBody] = useState('');
    const [participantsList, setParticipantsList] = useState({});
    const [clockOpen, setClockOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [minDateToAllowUpdates, setMinDateToAllowUpdates] = useState(new Date((new Date()).getTime() + 300000));
    const [openCancelStreamDialog, setOpenCancelStreamDialog] = useState(false);
    const [openCanceledStreamSuccessfulDialog, setOpenCanceledStreamSuccessfulDialog] = useState(false);
    const [disableChangesButton, setDisableChangesButton] = useState(true);
    const { t } = useTranslation();
    const classes = useStyles();
    const history = useHistory();

    useEffect(() => {
        async function setStreamData() {
            if (streamType === SCHEDULED_EVENT_TYPE) {
                const timeStamp = await loadApprovedStreamTimeStamp(streamId);
                if (timeStamp.exists()) {
                    setSelectedDate(new Date(timeStamp.val()));
                    setDisplayDate(new Date(timeStamp.val()));
                    setFirstTimestamp(new Date(timeStamp.val()));
                    setMinDateToAllowUpdates(new Date(timeStamp.val() - 300000));
                }
            }
        }

        async function setStreamParticipantsList() {
            const participantsList = await getStreamParticipantsList(streamId);
            if (participantsList.exists()) {
                setParticipantsList(participantsList.val());
            }
        }

        async function setStreamTitle() {
            if (streamType === SCHEDULED_EVENT_TYPE) {
                const title = await getStreamTitle(streamId);
                setTitle(title.val());
            } else if (streamType === PAST_STREAMS_EVENT_TYPE) {
                if (user.uid) {
                    const title = await getPastStreamTitle(user.uid, streamId);
                    setTitle(title.val());
                }
            }
        }

        setStreamData();
        setStreamParticipantsList();
        setStreamTitle();
    }, [streamId, streamType, user]);

    const sendNotification = async () => {
        await notifyAboutStreamToFollowersAndParticipants(streamId,
            user.uid,
            {
                es: title.es,
                en: title.en
            },
            {
                es: notificationBody,
                en: notificationBody
            },
            'reminders'
        );

        setNotificationBody('');
        alert(t('EditStream.alerts.sent'));
    }

    const onChangeNotificationBody = (e) => {
        const body = e.target.value;
        if (body.length <= 140) {
            setNotificationBody(body);
        }
    }

    const saveDate = async () => {
        if (selectedDate) {
            const minValidDate = new Date().getTime() + 300000;
            if (selectedDate.getTime() >= minValidDate) {
                const dateRef = new Date(selectedDate);
                const UTCDay = dateRef.getUTCDate() < 10 ? `0${dateRef.getUTCDate()}` : dateRef.getUTCDate();
                const UTCMonth = dateRef.getUTCMonth() + 1 < 10 ? `0${dateRef.getUTCMonth() + 1}` : dateRef.getUTCMonth() + 1;
                let UTCDate = `${UTCDay}-${UTCMonth}-${dateRef.getUTCFullYear()}`;

                const UTCHours = dateRef.getUTCHours() < 10 ? `0${dateRef.getUTCHours()}` : dateRef.getUTCHours();
                const UTCMinutes = dateRef.getUTCMinutes() < 10 ? `0${dateRef.getUTCMinutes()}` : dateRef.getUTCMinutes();
                let UTCHour = `${UTCHours}:${UTCMinutes}`;

                const localDay = dateRef.getDate() < 10 ? `0${dateRef.getDate()}` : dateRef.getDate();
                const localMonth = dateRef.getMonth() + 1 < 10 ? `0${dateRef.getMonth() + 1}` : dateRef.getMonth() + 1;
                let localDate = `${localDay}-${localMonth}-${dateRef.getFullYear()}`;

                const localHours = dateRef.getHours() < 10 ? `0${dateRef.getHours()}` : dateRef.getHours();
                const localMinutes = dateRef.getMinutes() < 10 ? `0${dateRef.getMinutes()}` : dateRef.getMinutes();
                let localHour = `${localHours}:${localMinutes}`;

                await updateStreamDate(user.uid, streamId, UTCDate, UTCHour, localDate, localHour, dateRef.getTime());
                notifyUpdateToQaplaAdmins(streamId, user.displayName, dateRef);

                return true;
            } else {
                alert(t('EditStream.alerts.errorDate'))
            }
        } else {
            alert(t('EditStream.alerts.errorDate'));
        }
    }

    const saveChanges = async () => {
        const dateChanged = !((new Date()).getTime() >= minDateToAllowUpdates || selectedDate.getTime() === firstTimestamp.getTime());
        let dateUpdated = false;
        if (dateChanged) {
            dateUpdated = await saveDate();
        }

        // disableChangesButton is only false when title has changed
        if (!disableChangesButton && title.en && title.es) {
            await updateStreamTitle(streamId, title);
        }

        if (!disableChangesButton || (dateChanged && dateUpdated)) {
            alert(t('EditStream.alerts.updated'));
        }
    }

    const handleDateChange = (date) => {
        try {
            setSelectedDate(date.$d);

        } catch (e) { console.log(e) }

        setDisplayDate(date)
    };

    const cancelStream = async () => {
        await cancelStreamRequest(user.uid, streamId);
        setOpenCancelStreamDialog(false);
        setOpenCanceledStreamSuccessfulDialog(true);
    }

    return (
        <StreamerDashboardContainer user={user}>
            <Grid container>
                <Grid xs={12}>
                    <BackButton label={title && title['en'] ? title['en'] : ''}
                        onClick={history.goBack} />
                </Grid>
                <Grid container style={{ maxWidth: '588px' }}>
                    {streamType === SCHEDULED_EVENT_TYPE &&
                        <>
                            <Grid xs={12}>
                                <SectionHeader
                                    title={t('EditStream.change')}
                                    description={t('EditStream.changeDesc')} />
                                <Grid item sm={12}>
                                    <Grid container>
                                        {selectedDate === null ? // to secure that dateState.getTime() isn't from a null
                                            <></>
                                            :
                                            <MuiPickersUtilsProvider utils={DayJsUtils}>
                                                <Grid container style={{
                                                    marginTop: '24px'
                                                }}>
                                                    <Grid item sm={12} md={6}>
                                                        <InputLabel className={classes.datePickerLabel}>
                                                            {t('NewStream.date')}
                                                        </InputLabel>
                                                        <KeyboardDatePicker
                                                            disabled={(new Date()).getTime() >= minDateToAllowUpdates.getTime()}
                                                            open={calendarOpen}
                                                            onClick={() => (new Date()).getTime() >= minDateToAllowUpdates.getTime() ? {} : setCalendarOpen(true)}
                                                            onClose={() => setCalendarOpen(false)}
                                                            clearable
                                                            disablePast
                                                            disableToolbar
                                                            autoOk
                                                            value={displayDate}
                                                            placeholder='10-10-2021'
                                                            onChange={handleDateChange}
                                                            minDate={new Date()}
                                                            format='DD-MM-YY ddd'
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
                                                    <Grid item sm={12} md={6}>
                                                        <InputLabel className={classes.datePickerLabel}>
                                                            {t('NewStream.time')}
                                                        </InputLabel>
                                                        <KeyboardTimePicker
                                                            open={clockOpen}
                                                            onClick={() => (new Date()).getTime() >= minDateToAllowUpdates.getTime() ? {} : setClockOpen(true)}
                                                            onOpen={() => { }}
                                                            onClose={() => setClockOpen(false)}
                                                            disabled={(new Date()).getTime() >= minDateToAllowUpdates.getTime()}
                                                            autoOk
                                                            error={(new Date()).getTime() >= minDateToAllowUpdates.getTime()}
                                                            helperText={(new Date()).getTime() >= minDateToAllowUpdates.getTime() ? t('EditStream.alerts.updatesPolicy') : ''}
                                                            value={displayDate}
                                                            placeholder='08:00 AM'
                                                            onChange={handleDateChange}
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
                                        }
                                        <Button className={classes.button}
                                            onClick={saveChanges}
                                            buttonColor={2}
                                            disabled={disableChangesButton && ((new Date()).getTime() >= minDateToAllowUpdates || selectedDate.getTime() === firstTimestamp.getTime())}>
                                            {t('EditStream.save')}
                                        </Button>
                                    </Grid>
                                </Grid>
                                <SectionHeader title={t('EditStream.sendMessage')}
                                    description={t('EditStream.sendMessageDesc')} />
                                <Grid item md={12} style={{
                                    marginTop: '32px'
                                }}>
                                    <StreamerTextInput placeholder={t('EditStream.limit')}
                                        multiline
                                        rows={3}
                                        fullWidth
                                        textInputClassName={classes.textArea}
                                        containerClassName={classes.containerTextArea}
                                        value={notificationBody}
                                        onChange={onChangeNotificationBody} />
                                    <Button className={classes.button}
                                        disabled={!notificationBody}
                                        onClick={sendNotification}>
                                        {t('QaplaStreamDialogs.EventManagementDialog.send')}
                                    </Button>
                                </Grid>
                                <SectionHeader title={t('EditStream.cancelStream')}
                                    description={t('EditStream.cancelStreamDescription')} />
                                <Grid item md={12} style={{
                                    marginTop: '32px'
                                }}>
                                    <Button className={classes.cancelButton}
                                        onClick={() => setOpenCancelStreamDialog(true)}>
                                        {t('EditStream.cancelStream')}
                                    </Button>
                                </Grid>
                            </Grid>
                        </>
                    }
                </Grid>
                <div style={{ width: '32px' }}></div>
                <Grid container style={{ maxWidth: '274px', flexDirection: 'column' }} alignItems='flex-start'>
                    <SectionHeader title={t('NewStream.streamTitle')}
                        description={t('NewStream.streamTitleDescription')} />
                    <div style={{ marginTop: '24px' }}>
                        <StreamerTextInput
                            textInputStyle={{ marginTop: '8px' }}
                            label={t('NewStream.streamTitle')}
                            placeholder={t('NewStream.streamTitlePlaceholder')}
                            id='eventTitle'
                            fullWidth={true}
                            value={title.en}
                            onChange={(e) =>{ setDisableChangesButton(false); setTitle({ en: e.target.value, es: e.target.value }); }}
                        />
                    </div>
                </Grid>
            </Grid>
            <EventConfirmCancellationDialog open={openCancelStreamDialog}
                streamTitle={title.en}
                streamerName={user.displayName}
                streamerUid={user.uid}
                streamId={streamId}
                onClose={() => setOpenCancelStreamDialog(false)}
                cancelStream={cancelStream} />
            <SuccessDialog open={openCanceledStreamSuccessfulDialog}
                title={t('StreamCard.successfullyCanceledStreamDialogTitle')}
                buttonText={t('StreamCard.successfullyCanceledStreamDialogButtonText')}
                onClose={() => { history.push('/profile'); setOpenCanceledStreamSuccessfulDialog(false); }} />
        </StreamerDashboardContainer>
    );
}

export default EditStreamerEvent;