const ELEMENT = document.getElementById("main");

let MAPPING = [];

for(let _y=0; _y<20; _y++) {
    for(let _x=0; _x<5; _x++) {
        MAPPING.push(new HexTile(_x, _y, Math.round(Math.random()+1)));
    }
}

function start() {
    HexTiler.draw(ELEMENT, MAPPING);
}

start();