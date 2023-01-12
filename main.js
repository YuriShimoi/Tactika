const ELEMENT = document.getElementById("main");

let MAPPING = [
    new HexTile(0, 0, 7),
    new HexTile(1, 0, 5),
    new HexTile(2, 0, 3),
    new HexTile(3, 0, 1),
    new HexTile(0, 1, 6),
    new HexTile(1, 1, 4),
    new HexTile(2, 1, 2),
    new HexTile(3, 1, 0),
    new HexTile(0, 2, 7),
    new HexTile(1, 2, 5),
    new HexTile(2, 2, 3),
    new HexTile(3, 2, 1),
    new HexTile(0, 3, 6),
    new HexTile(1, 3, 4),
    new HexTile(2, 3, 2),
    new HexTile(3, 3, 0),
    new HexTile(0, 4, 7),
    new HexTile(1, 4, 5),
    new HexTile(2, 4, 3),
    new HexTile(3, 4, 1),
    new HexTile(0, 5, 6),
    new HexTile(1, 5, 4),
    new HexTile(2, 5, 2),
    new HexTile(3, 5, 0),
    new HexTile(0, 6, 7),
    new HexTile(1, 6, 5),
    new HexTile(2, 6, 3),
    new HexTile(3, 6, 1),
    new HexTile(0, 7, 5),
    new HexTile(1, 7, 4),
    new HexTile(2, 7, 2),
    new HexTile(3, 7, 0),
    new HexTile(0, 8, 5),
    new HexTile(1, 8, 5),
    new HexTile(2, 8, 3),
    new HexTile(3, 8, 1),
    new HexTile(0, 9, 5),
    new HexTile(1, 9, 3),
    new HexTile(2, 9, 1),
    new HexTile(3, 9, 0),
    new HexTile(0,10, 5),
    new HexTile(1,10, 3),
    new HexTile(2,10, 1),
    new HexTile(3,10, 0),
    new HexTile(0,11, 4),
    new HexTile(1,11, 2),
    new HexTile(2,11, 1),
    new HexTile(3,11, 0),
    new HexTile(0,12, 4),
    new HexTile(1,12, 2),
    new HexTile(2,12, 1),
    new HexTile(3,12, 0),
];

// for(let _y=0; _y<20; _y++) {
//     for(let _x=0; _x<5; _x++) {
//         MAPPING.push(new HexTile(_x, _y, Math.round(Math.random()*2+1)));
//     }
// }

function start() {
    HexTiler.draw(ELEMENT, MAPPING);
    // hihi
}

start();