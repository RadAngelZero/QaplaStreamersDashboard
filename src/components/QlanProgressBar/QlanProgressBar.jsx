import React, { useState, useEffect } from 'react';

import QaplaLogoOverlay from './../../assets/Qapla-Logo-Overlay.png';

const QlanProgressBar = ({ percentage = 0, xq = 0 }) => {

    const [percentageSave, setPercentageSave] = useState(0);
    const [playProgressAnimation, setPlayProgressAnimation] = useState("false")
    const [xqSave, setXqSave] = useState(0);
    const [playXqAnimation, setPlayXqAnimation] = useState("false")

    useEffect(() => {
        setPlayProgressAnimation("true");
        setPlayXqAnimation("true");
    }, [percentage])

    const gradientAnimation = `
    @keyframes gradient-animation {
        from    {transform: translateX(0%);}
        to      {transform: translateX(-50%);}
    }
    
    .gradient-container {
        animation-name: gradient-animation;
        animation-duration: 5s;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
    }
    `

    const progressAnimation = `
    @keyframes progress-animation {
        from {width: ${percentageSave * 100}%;}
        to {width: ${percentage * 100}%;}
    }

    .progress-container {
        display: flex;
        height: 100%;
        width: ${percentageSave * 100}%;
        overflow: hidden;
    }

    .progress-container[playAnimation="true"] {
        animation-name: progress-animation;
        animation-duration: 5s;
        animation-iteration-count: 1;
        animation-timing-function: ease-out;
    }
    `

    const xqAnimation = `
    @property --num {
        syntax: "<integer>";
        initial-value: ${xqSave};
        inherits: false;
    }

    .xq-container {
        color: #0AFFD2;
        counter-set: num var(--num);
    }

    .xq-container:after{
        content: counter(num);
    }

    .xq-container[playAnimation='true'] {
        animation-name: counter;
        animation-duration: 5s;
        animation-iteration-count: 1;
        animation-timing-function: ease-in-out;
        counter-reset: num var(--num);
    }

    @keyframes counter {
        from {
          --num: ${xqSave};
        }
        to {
          --num: ${xq};
        } 
    `

    return (
        <div style={{
            display: 'flex',

        }}>
            <div style={{
                display: 'flex',
                // zIndex: 10,
            }}>
                <img src={QaplaLogoOverlay} alt='QaplaLogoOverlay' style={{ width: '151px' }} />
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                bottom: 0,
                left: '102px',
            }}>
                <div style={{
                    alignSelf: 'flex-end',
                    marginRight: '6px',
                    borderRadius: '6px',
                    backgroundColor: '#4446',
                    padding: '2px 6px'
                }}>
                    <p style={{
                        color: '#fff'

                    }}>{`QLAN XQ `}
                        <span
                        className='xq-container'
                        onAnimationEnd={() => {
                            setXqSave(xq);
                            setPlayXqAnimation('false');
                            console.log('xq end')
                        }}
                        playAnimation={playXqAnimation}
                        
                        >
                            <style>{xqAnimation}</style>
                        </span>
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    backgroundColor: '#0D1021',
                    width: '186px',
                    height: '20px',
                    borderRadius: '5px',
                    overflow: 'hidden',
                }}>
                    <div
                        onAnimationEnd={() => {
                            setPercentageSave(percentage);
                            setPlayProgressAnimation('false');
                            console.log('progress end');
                        }}
                        className="progress-container"
                        playAnimation={playProgressAnimation}
                    >
                        <style>{progressAnimation}</style>
                        <div style={{
                            display: 'flex',
                            height: '100%',
                        }}
                            className="gradient-container"
                        >
                            <style>{gradientAnimation}</style>
                            <div style={{
                                background: 'linear-gradient(270deg, #4FF4FF 0%, #924FFF 52.52%, #FF8ADE 100%), #0AFFD2',
                                height: '100%',
                                minWidth: '186px',
                            }} />
                            <div style={{
                                background: 'linear-gradient(90deg, #4FF4FF 0%, #924FFF 52.52%, #FF8ADE 100%), #0AFFD2',
                                height: '100%',
                                minWidth: '186px',
                            }} />
                            <div style={{
                                background: 'linear-gradient(270deg, #4FF4FF 0%, #924FFF 52.52%, #FF8ADE 100%), #0AFFD2',
                                height: '100%',
                                minWidth: '186px',
                            }} />
                            <div style={{
                                background: 'linear-gradient(90deg, #4FF4FF 0%, #924FFF 52.52%, #FF8ADE 100%), #0AFFD2',
                                height: '100%',
                                minWidth: '186px',
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QlanProgressBar