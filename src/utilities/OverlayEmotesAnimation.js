import { gsap } from 'gsap';
import { Engine, Render, Runner, Bodies, Composite, Body, Events } from 'matter-js';

export function emoteExplosion(container, emotesArray) {
    let flyingMen = [];

    class Emote {
        constructor(face, startx, starty, flour, flyUpMax) {
            this.isAlive = true;
            this.face = face;
            this.x = startx;
            this.y = starty;
            this.flourLevel = flour;
            this.increment = -Math.floor((Math.random() * flyUpMax) + 10);
            this.xincrement = Math.floor((Math.random() * 10) + 1);
            this.xincrement *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
            this.element = document.createElement('img');
            this.element.src = face;
            this.element.style.position = 'absolute';
            this.element.style.width = '64px';
            container.appendChild(this.element);

            this.refresh = function () {
                if (this.isAlive) {
                    this.y += this.increment;
                    this.x += this.xincrement;
                    this.increment += 0.25;

                    if (this.y >= this.flourLevel) {
                        if (this.increment <= 5) {
                            this.isAlive = false;
                        }
                        this.increment = -this.increment + 5;
                    }

                    this.element.style.transform = 'translate(' + this.x + 'px, ' + this.y + 'px)';
                } else {
                    this.element.style.transform = 'translate(px, px)';
                }
            }
        }
    }

    const xv = document.body.clientWidth / 2;
    const yv = document.body.clientHeight / 2;
    const fl = document.body.clientHeight;
    for (let i = 0; i < 50; i++) {
        const randomEmoteIndex = Math.floor(Math.random() * emotesArray.length);
        const face = emotesArray[randomEmoteIndex];
        const coolGuy = new Emote(face, xv, yv, fl, 12);
        flyingMen.push(coolGuy);
    }

    function render() {
        for (let i = 0; i < flyingMen.length; i++) {
            if (flyingMen[i].isAlive) {
                flyingMen[i].refresh();
            } else {
                flyingMen[i].element.remove();
                flyingMen.splice(i, 1);
            }
        }
        requestAnimationFrame(render);
    }

    render();
}

export function startEmoteRain(engine, emotesArray, duration) {
    if (isNaN(duration)) {
        duration = 10
    }

    let bottomDetector = Bodies.rectangle(document.body.clientWidth / 2, document.body.clientHeight + 200, document.body.clientWidth * 3, 80, {
        isStatic: true,
        label: 'deathzone'
    });

    Events.on(engine, 'collisionStart', ({ pairs }) => {
        let bodies = pairs;

        bodies.forEach(pair => {
            if (pair.bodyA.label !== pair.bodyB.label) {
                if (pair.bodyA.label === 'drop') {
                    Composite.remove(engine.world, pair.bodyA, true);
                } else {
                    Composite.remove(engine.world, pair.bodyB, true);
                }
            }
        })

    })

    engine.world.gravity.y = 0.4
    engine.world.gravity.x = 0.02

    setTimeout(() => {
        resetEngine(engine);
    }, (duration + 5) * 1000);

    Composite.add(engine.world, bottomDetector);

    generateDrop(engine, emotesArray, duration, 0);

    manageWind(engine, duration, 0);

}

function resetEngine(engine) {
    engine.world.gravity.y = 1;
    engine.world.gravity.x = 0;
    Events.off(engine, 'collisionStart');
    Composite.clear(engine.world, false, true);
}

function generateDrop(engine, emotesArray, duration, count) {
    if (count >= duration * 1000) return;
    let randomInterval = Math.floor((Math.random() * 100) + 20);
    let randomXPos = Math.floor((Math.random() * (document.body.clientWidth - 100)) + 100);
    let randomAirFriction = Math.random() * 0.05;

    const randomEmoteIndex = Math.floor(Math.random() * emotesArray.length);
    let drop = Bodies.rectangle(randomXPos, -100, 2, 2, {
        render: {
            sprite: {
                texture: emotesArray[randomEmoteIndex],
                xScale: 0.8,
                yScale: 0.8,
            }
        },
        label: 'drop',
        frictionAir: randomAirFriction,
    });

    Composite.add(engine.world, drop);

    setTimeout(() => {
        generateDrop(engine, emotesArray, duration, count + randomInterval);
    }, randomInterval);

}

function manageWind(engine, duration, count) {
    if (count >= (duration + 4.5) * 1000) return;

    let randomInterval = Math.floor((Math.random() * 800) + 200);

    engine.world.gravity.x = engine.world.gravity.x >= 0 ? -0.2 : 0.2;

    setTimeout(() => {
        manageWind(engine, duration, count + randomInterval);
    }, randomInterval);

}

// https://www.youtube.com/watch?v=4NhLMNkyeh4
export function emoteTunnel(container, emotesArray, duration) {
    for (let i = 0; i < 50; i++) {
        const randomEmoteIndex = Math.floor(Math.random() * emotesArray.length);
        const confetti = document.createElement('div');
        const image = document.createElement('img');
        confetti.style = 'position: absolute; perspective: 1000px; top: 50%; left: 50%; transform: translate(-50%, -50%);';
        image.src = emotesArray[randomEmoteIndex];
        image.style.width = '64px';
        confetti.appendChild(image);
        container.appendChild(confetti);
    }

    const TLCONF = gsap.timeline();

    TLCONF
        .to('#emote-tunel-container img', {
            y: 'random(-400,400)',
            x: 'random(-400,400)',
            z: 'random(0,1000)',
            rotation: 'random(-90, 90)',
            duration: !isNaN(duration) ? duration : 10,
        })
        .to('#emote-tunel-conatainer img', { alpha: 0, duration: 1.3 },
            '-=0.2')
        .add(() => {
            container.innerHTML = '';
        })
}

export function startMatterEngine(container, refEngine) {
    const canvas = container.current.firstChild;

    let engine = Engine.create();

    let render = Render.create({
        element: container,
        engine,
        options: {
            background: '#0000',
            width: document.body.clientWidth,
            height: document.body.clientHeight,
            wireframes: false,
        },
        canvas
    });

    Render.run(render);

    let runner = Runner.create();

    Runner.run(runner, engine);

    refEngine.current = engine;
}

export function startEmoteFireworks(engine, emotesArray, amount) {
    if (isNaN(amount)) {
        amount = 10;
    }

    spawnFirework(engine, emotesArray, amount, 0);
}

export function spawnFirework(engine, emotesArray, amount = 0, count = 1) {
    if (amount <= count) {
        return;
    }

    let sparks = [];
    let startX = Math.floor(Math.random() * ((document.body.clientWidth - 100) - 100 + 1)) + 100;
    let startY = Math.floor(Math.random() * ((document.body.clientHeight - 100) - 100 + 1)) + 100;
    let randomDelay = Math.floor(Math.random() * (1500 - 200 + 200)) + 200;

    const randomEmoteIndex = Math.floor(Math.random() * emotesArray.length);
    for (let i = 0; i < 50; i++) {
        let spark = Bodies.rectangle(startX, startY, 80, 80, {
            render: {
                sprite: {
                    texture: emotesArray[randomEmoteIndex],
                    xScale: 0.8,
                    yScale: 0.8,
                }
            },
            collisionFilter: {
                group: -1,
                category: 2,
                mask: 0,
            }
        });
        sparks.push(spark);
    }

    Composite.add(engine.world, sparks);

    sparks.forEach(body => {
        let forceOffsetX = (Math.floor(Math.random() * (20 - 20 + 1)) + 20) * (Math.round(Math.random()) ? 1 : -1);
        let forceY = (Math.random() * (0.5 - 0.1 + 0.1) + 0.1) * (Math.round(Math.random()) ? 1 : -1);
        let forceX = (Math.random() * (0.6 - 0.2 + 0.1) + 0.2) * (Math.round(Math.random()) ? 1 : -1);
        Body.applyForce(body, { x: (body.position.x + forceOffsetX), y: body.position.y }, { x: forceX, y: forceY });
    });

    setTimeout(() => {
        sparks.forEach(spark => {
            Composite.remove(engine.world, spark)
        })
    }, 2000);

    setTimeout(() => {
        spawnFirework(engine, emotesArray, amount, count + 1);
    }, randomDelay);
}