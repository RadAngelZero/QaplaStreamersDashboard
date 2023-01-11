// ref https://codepen.io/ItsConnor/pen/epBGzM
export function EmoteExplosion (container, emote) {
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