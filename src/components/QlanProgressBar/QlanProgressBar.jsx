import React from 'react';

import QaplaLogoOverlay from './../../assets/Qapla-Logo-Overlay.png';

const QlanProgressBar = ({ percentage = 0, xq = 0 }) => {

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

                    }}>{`QLAN XQ ${xq}`}

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
                    {/* <style>{gradientAnimation}</style> */}
                    <div style={{
                        display: 'flex',
                        height: '100%',
                        width: `${percentage * 100}%`,
                        overflow: 'hidden',
                    }}>
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