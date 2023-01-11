const ELEMENT = document.getElementById("main");

let MAPPING = [
    new HexTile(0,0,3),
    new HexTile(1,0,1),
    new HexTile(0,1,2),
    new HexTile(0,2,1),
    new HexTile(1,2,1),
    new HexTile(0,3,1, ['water-tile'])
];

function start() {
    HexTiler.draw(ELEMENT, MAPPING);
    // hihi
}

start();