import React from 'react';

import { Button, Dialog,  makeStyles,Checkbox } from '@material-ui/core';
import { ReactComponent as Unchecked } from './../../assets/Unchecked.svg';
import { ReactComponent as Checked } from './../../assets/Checked.svg';

const useStyles = makeStyles((theme) => ({
    dialogContainer: {
    backdropFilter: "blur(20px)",
    },
    dialogRoot: {},
    paper: {
    backgroundColor: "#141833",
    color: "#FFF",
    overflow: "visible",
    borderRadius: "35px",
    },
    ButtonRoot:{
        background:"linear-gradient(0deg, #3B4BF9, #3B4BF9), #FF006B;",
        color: "#FFFFFF",
        fontSize:"14px",
        fontWeight:"600",
        lineHeight:"22px",
        textTransform:'none',
        width:"202px",
        height:"56px",
        borderRadius:"16px",
        boxShadow: '0px 20px 40px -10px rgba(59, 75, 249, 0.4)'
    },
    ButtonClose:{
        textTransform: "none",
        fontWeight:'600',
        fontSize:'14px',
        color:' #3B4BF9',
        lineHeight:'22px'

    }
}));


const DialogOnlyQoins = ({open,onClose, setConfirDialog}) => {
    const classes = useStyles();

    return (
        <Dialog
         open={open}
         onClose={onClose}
         classes={{
            container: classes.dialogContainer,
            root: classes.dialogRoot,
            paper: classes.paper,
          }}>
            <div>
                <div  style={{ width: '347px', height: '384px', display: 'flex', justifyContent: 'space-evenly', marginTop:'20px', alignItems: 'center', flexDirection: 'column', padding: '20px'}}>
                    <p style={{fontSize:'18px', fontWeight:'600', textAlign: 'center', maxWidth:'270px'}}>Accept only paid reactions with Qoins</p>
                    <p style={{fontSize:'12px', fontWeight:'400', textAlign: 'center', color:'#8F9BBA', maxWidth:'230px'}}>Your viewers wont spend their channel points, instead they will need to use Qoins to send reactions</p>
                    <Button classes={{
                            root: classes.ButtonRoot
                        }} onClick={() => setConfirDialog(true)}>Enable Only Qoins
                    </Button>
                    <Button classes={{
                            root: classes.ButtonClose
                        }}>Cancel and go back</Button>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}> 
                        <Checkbox
                        icon={<Unchecked />}
                        checkedIcon={<Checked />}
                        style={{ paddingRight: '0px' }} />
                        <p style={{color: '#FFFFFF', fontSize: '10px', fontWeight: '400', lineHeight:'16px', marginLeft:'8px'}}>Don’t show this message again</p>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}

export default DialogOnlyQoins