import React, { useState, useEffect } from 'react';

import QaplaLogoOverlay from './../../assets/Qapla-Logo-Overlay.png';

const GoalProgressBar = ({ percentage = 0, title, qoins = 0 }) => {

    const [percentageSave, setPercentageSave] = useState(0);
    const [playProgressAnimation, setPlayProgressAnimation] = useState("false")
    const [Qoins, setQoins] = useState(0);
    const [playXqAnimation, setPlayXqAnimation] = useState("false")

    useEffect(() => {
        setPlayProgressAnimation("true");
        setPlayXqAnimation("true");
    }, [percentage, qoins])

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
        initial-value: ${Qoins};
        inherits: false;
    }

    .qoins-container {
        color: #0AFFD2;
        counter-set: num var(--num);
    }

    .qoins-container:after{
        content: counter(num);
    }

    .qoins-container[playAnimation='true'] {
        animation-name: counter;
        animation-duration: 5s;
        animation-iteration-count: 1;
        animation-timing-function: ease-in-out;
        counter-reset: num var(--num);
    }

    @keyframes counter {
        from {
          --num: ${Qoins};
        }
        to {
          --num: ${qoins};
        } 
    `

    return (
        <div style={{
            display: 'flex',

        }}>
            <div style={{
                display: 'flex',
                zIndex: 10,
            }}>
                <img src={QaplaLogoOverlay} alt='QaplaLogoOverlay' style={{ width: '151px' }} />
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                bottom: 0,
                left: '102px'
            }}>
                <div style={{
                    alignSelf: 'flex-start',
                    marginLeft: 48,
                    marginRight: '6px',
                    borderRadius: '6px',
                    backgroundColor: '#444c',
                    padding: '2px 6px'
                }}>
                    <p style={{
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: '400',
                        lineHeight: '18px',
                        letterSpacing: '0.3499999940395355px',

                    }}
                        ref={(el) => {
                            if (el) {
                                el.style.setProperty('font-family', `'Mechsuit', sans-serif`, 'important');
                            }
                        }}
                    >{`${title} `}
                        <span
                            className='qoins-container'
                            onAnimationEnd={() => {
                                setQoins(qoins);
                                setPlayXqAnimation('false');
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
                    width: 320,
                    height: '20px',
                    borderRadius: '5px',
                    overflow: 'hidden',
                }}>
                    <div
                        onAnimationEnd={() => {
                            setPercentageSave(percentage);
                            setPlayProgressAnimation('false');
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

export default GoalProgressBar