import React, { useState, useEffect } from 'react';
import {
    makeStyles,
    Grid,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    withStyles,
    Avatar
} from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { useParams, useLocation } from 'react-router';

import StreamerDashboardContainer from '../StreamerDashboardContainer/StreamerDashboardContainer';
import StreamerTextInput from '../StreamerTextInput/StreamerTextInput';
import { ReactComponent as CalendarIcon } from './../../assets/CalendarIcon.svg';
import { ReactComponent as TimeIcon } from './../../assets/TimeIcon.svg';
import { ReactComponent as ProfileIcon } from './../../assets/ProfileIcon.svg';
import { ReactComponent as EyeIcon } from './../../assets/EyeIcon.svg';
import { ReactComponent as DownloadIcon } from './../../assets/DownloadIcon.svg';

import ContainedButton from '../ContainedButton/ContainedButton';
import BackButton from '../BackButton/BackButton';
import { SCEHDULED_EVENT_TYPE, PAST_STREAMS_EVENT_TYPE } from '../../utilities/Constants';
import { loadApprovedStreamTimeStamp, getStreamParticipantsList, getStreamTitle, getPastStreamTitle } from '../../services/database';
import { sednPushNotificationToTopic } from '../../services/functions';

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: '24px',
        color: '#FFF'
    },
    description: {
        fontSize: '12px',
        color: 'rgba(255,255,255,0.60)',
        lineHeight: '18px',
        paddingRight: '2rem',
        marginBottom: '2rem'
    },
    button: {
        marginTop: '2.5rem'
    },
    containerTextArea: {
        marginRight: '2.5rem'
    },
    textArea: {
        paddingTop: '1rem'
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
        <>
            <p className={classes.title}>
                {title}
            </p>
            <p className={classes.description}>
                {description}
            </p>
        </>
    );
};

const EditStreamerEvent = ({ user }) => {
    const { streamType } = useLocation().state;
    const { streamId } = useParams();
    const [title, setTitle] = useState({ en: '', es: '' });
    const [date, setDate] = useState('');
    const [hour, setHour] = useState('');
    const [notificationBody, setNotificationBody] = useState('');
    const [participantsList, setParticipantsList] = useState({});
    const classes = useStyles();
    const history = useHistory();

    useEffect(() => {
        async function setStreamData() {
            if (streamType === SCEHDULED_EVENT_TYPE) {
                const timeStamp = await loadApprovedStreamTimeStamp(streamId);
                const referenceDate = new Date(timeStamp.val());
                setDate(`${referenceDate.getDate() >= 10 ? referenceDate.getDate() : `0${referenceDate.getDate()}`}/${referenceDate.getMonth() + 1 >= 10 ? referenceDate.getMonth() + 1 : `0${referenceDate.getMonth() + 1}`}/${referenceDate.getFullYear()}`);
                setHour(`${referenceDate.getHours() >= 10 ? referenceDate.getHours() : `0${referenceDate.getHours()}`}:${referenceDate.getMinutes() >= 10 ? referenceDate.getMinutes() : `0${referenceDate.getMinutes()}`}`);
            }
        }

        async function setStreamParticipantsList() {
            const participantsList = await getStreamParticipantsList(streamId);
            if (participantsList.exists()) {
                setParticipantsList(participantsList.val());
            }
        }

        async function setStreamTitle() {
            if (streamType === SCEHDULED_EVENT_TYPE) {
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

    const sendNotification = () => {
        sednPushNotificationToTopic(streamId, title['en'], notificationBody);
    }

    const onChangeNotificationBody = (e) => {
        const body = e.target.value;
        if (body.length <= 140) {
            setNotificationBody(body);
        }
    }

    return (
        <StreamerDashboardContainer user={user}>
            <Grid container>
                <Grid xs={12}>
                    <BackButton label={title && title['en'] ? title['en'] : ''}
                        onClick={history.goBack} />
                </Grid>
                {streamType === SCEHDULED_EVENT_TYPE &&
                    <>
                        <Grid xs={6}>
                            <SectionHeader title='Edit'
                                description='A notification will be sent to the participants of any changes. We recommend not changing the date or time often tho, a consistent schedule drives more traffic to your live streams.' />
                            <Grid container>
                                <Grid item md={6}>
                                    <StreamerTextInput label='Date'
                                        placeholder='30/12/2020'
                                        Icon={CalendarIcon}
                                        value={date}
                                        onChange={setDate} />
                                    <ContainedButton className={classes.button}>
                                        Save Changes
                                    </ContainedButton>
                                </Grid>
                                <Grid item md={6}>
                                    <StreamerTextInput label='Time'
                                        placeholder='18:00 hrs'
                                        Icon={TimeIcon}
                                        value={hour}
                                        onChange={setHour} />
                                </Grid>
                            </Grid>
                            <Grid item md={12}>
                                <SectionHeader title='Notifications'
                                    description='You can send participants two custom notifications to share any relevant information about your stream. Make them short and only send important notices. Spaming  can have a negative impact on your stream.' />
                                <StreamerTextInput placeholder='140 character limit'
                                    multiline
                                    rows={3}
                                    fullWidth
                                    textInputClassName={classes.textArea}
                                    containerClassName={classes.containerTextArea}
                                    value={notificationBody}
                                    onChange={onChangeNotificationBody} />
                                <br/>
                                <ContainedButton className={classes.button}
                                    onClick={sendNotification}>
                                    Send
                                </ContainedButton>
                            </Grid>
                        </Grid>
                        {/** To define how this section is going to work
                            <Grid xs={6}>
                                <SectionHeader title='Private Rooms'
                                    description='If you are hosting a private room and want to give access to the participants of the event, you can share the ID with them directly in the Qapla app. Participants will get a notification to see the ID.' />
                                <StreamerTextInput label='ID'
                                    placeholder='ID' />
                                <br/>
                                <ContainedButton className={classes.button}>
                                    Send
                                </ContainedButton>
                            </Grid>
                        */}
                 </>
                }
                <Grid xs={12}>
                    <SectionHeader title='Participants' />
                    <TableContainer className={classes.tableContainer}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCellStyled align='center' padding='checkbox'>
                                        <ProfileIcon />
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>Twitch Username</TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>Game Username</TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>Qapla Username</TableCellStyled>
                                    <TableCellStyled className={classes.participantsColumn}>
                                        <EyeIcon /> <p>{Object.keys(participantsList).length}</p>
                                    </TableCellStyled>
                                    <TableCellStyled className={classes.tableHead}>
                                        <ContainedButton
                                            startIcon={<DownloadIcon />}>
                                            Download List
                                        </ContainedButton>
                                    </TableCellStyled>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(participantsList).map((participantUid, index) => (
                                    <TableRow className={index % 2 === 0 ? classes.tableRow : classes.tableRowOdd}>
                                        <TableCellStyled align='center' className={classes.firstCell}>
                                            <Avatar className={classes.avatar} />
                                        </TableCellStyled>
                                        <TableCellStyled>
                                            {participantsList[participantUid].userName}
                                        </TableCellStyled>
                                        <TableCellStyled>
                                            {participantsList[participantUid].userName}
                                        </TableCellStyled>
                                        <TableCellStyled className={classes.lastCell}>
                                            {participantsList[participantUid].userName}
                                        </TableCellStyled>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </StreamerDashboardContainer>
    );
}

export default EditStreamerEvent;