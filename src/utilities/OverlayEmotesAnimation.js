// ref https://codepen.io/ItsConnor/pen/epBGzM
import { gsap } from "gsap";
import styles from '../components/LiveDonations/LiveDonations.module.css';
export function EmoteExplosion(container, emote) {
    var flyingMen = [];

    // var text = document.getElementById("face");
    // var button = document.getElementById('btn');
    // var fsize = document.getElementById("fsize");
    // text.value = "Hello 🌍";
    // fsize.value = "24";
    //emoji object
    function emoji(face, startx, starty, flour, fs, flyUpMax) {
        this.isAlive = true;
        this.face = face;
        this.x = startx;
        this.y = starty;
        this.flourLevel = flour;
        this.increment = -Math.floor((Math.random() * flyUpMax) + 10);
        this.xincrement = Math.floor((Math.random() * 10) + 1);
        this.xincrement *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
        this.element = document.createElement('img');
        this.element.src = face;
        this.element.style.position = "absolute";
        this.element.style.width = "64px";
        // this.element.style.fontSize = fs + "px";
        // this.element.style.color = "black";
        container.appendChild(this.element);

        this.refresh = function () {
            if (this.isAlive) {
                //------Y axis-----




                this.y += this.increment;
                this.x += this.xincrement;
                this.increment += 0.25;

                if (this.y >= this.flourLevel) {
                    if (this.increment <= 5) {
                        this.isAlive = false;
                    }
                    this.increment = -this.increment + 5;
                }

                this.element.style.transform = "translate(" + this.x + "px, " + this.y + "px)";
            } else {
                this.element.style.transform = "translate(px, px)";
            }
        }

    }



    // button.addEventListener("click", goB);

    function goB() {
        var fontsize = "24";
        console.log(document.body.clientWidth, document.body.clientHeight)
        var xv = document.body.clientWidth / 2;
        var yv = document.body.clientHeight / 2;
        var fl = document.body.clientHeight;
        var face = emote;
        for (var i = 0; i < 50; i++) {
            var coolGuy = new emoji(face, xv, yv, fl, fontsize, 12);
            flyingMen.push(coolGuy);
        }

    }

    goB();

    //Rendering
    function render() {
        for (var i = 0; i < flyingMen.length; i++) {
            if (flyingMen[i].isAlive == true) {
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

export function EmoteRain(container, emote) {

    /**
         * Emoji rain functions
         */
    let circles = [];

    function addEmoteCircle(delay, range, color) {
        setTimeout(function () {
            let c = new EmoteCircle(range[0] + Math.random() * range[1], 80 + Math.random() * 4, color, {
                x: -0.15 + Math.random() * 0.3,
                y: 1 + Math.random() * 10
            }, range);

            circles.push(c);
        }, delay);
    }

    class EmoteCircle {
        constructor(x, y, color, velocity, range) {
            let _this = this;
            this.x = x;
            this.y = y;
            this.color = color;
            this.velocity = velocity;
            this.range = range;
            this.element = document.createElement('img');
            /*this.element.style.display = 'block';*/
            this.element.style.opacity = 0;
            this.element.style.position = 'absolute';
            this.element.style.color = 'hsl(' + (Math.random() * 360 | 0) + ',80%,50%)';
            this.element.style.width = '30px'
            this.element.style.height = '30px'
            this.element.src = color;
            const localContainer = container;
            if (localContainer) {
                localContainer.appendChild(this.element);
            }

            this.update = function () {
                if (_this.y > 800) {
                    _this.y = 80 + Math.random() * 4;
                    _this.x = _this.range[0] + Math.random() * _this.range[1];
                }
                _this.y += _this.velocity.y;
                _this.x += _this.velocity.x;
                this.element.style.opacity = 1;
                this.element.style.transform = 'translate3d(' + _this.x + 'px, ' + _this.y + 'px, 0px)';
                this.element.style.webkitTransform = 'translate3d(' + _this.x + 'px, ' + _this.y + 'px, 0px)';
                this.element.style.mozTransform = 'translate3d(' + _this.x + 'px, ' + _this.y + 'px, 0px)';
            };
        }
    }

    function animate() {
        for (let i in circles) {
            circles[i].update();
        }

        return requestAnimationFrame(animate);
    }

    function executeEmoteRain(emote) {
        for (let i = 0; i < 10; i++) {
            addEmoteCircle(i * 350, [10 + 0, 300], emote[Math.floor(Math.random() * emote.length)]);
            addEmoteCircle(i * 350, [10 + 0, -300], emote[Math.floor(Math.random() * emote.length)]);
            addEmoteCircle(i * 350, [10 - 200, -300], emote[Math.floor(Math.random() * emote.length)]);
            addEmoteCircle(i * 350, [10 + 200, 300], emote[Math.floor(Math.random() * emote.length)]);
            addEmoteCircle(i * 350, [10 - 400, -300], emote[Math.floor(Math.random() * emote.length)]);
            addEmoteCircle(i * 350, [10 + 400, 300], emote[Math.floor(Math.random() * emote.length)]);
            addEmoteCircle(i * 350, [10 - 600, -300], emote[Math.floor(Math.random() * emote.length)]);
            addEmoteCircle(i * 350, [10 + 600, 300], emote[Math.floor(Math.random() * emote.length)]);
            addEmoteCircle(i * 350, [10 + 600, 300], emote[Math.floor(Math.random() * emote.length)]);
            addEmoteCircle(i * 350, [10 + 600, 300], emote[Math.floor(Math.random() * emote.length)]);
        }

        animate();
    }

    executeEmoteRain(emote);

}

export function EmoteTunel(container, emote) {

    function fiesta() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            const image = document.createElement('img');
            confetti.className = styles.confetti;
            image.src = emote;
            image.style.width = '64px';
            confetti.appendChild(image);
            container.appendChild(confetti);
        }
    }

    fiesta();

    animateConfettis();


    function animateConfettis() {
        const TLCONF = gsap.timeline();

        TLCONF
            .to('#emote-tunel-container img', {
                y: 'random(-400,400)',
                x: 'random(-400,400)',
                z: 'random(0,1000)',
                rotation: 'random(-90, 90)',
                duration: 10,
            })
            .to('#emote-tunel-conatainer img', { autoAlpha: 0, duration: 0.3 },
                '-=0.2')
            .add(() => {
                container.innerHTML = "";
            })
    }

}