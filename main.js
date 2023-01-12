const ELEMENT = document.getElementById("main");

let MAPPING = [new HexTile(1, 6, 10), new HexTile(2, 6, 9), new HexTile(3, 6, 8)];

for(let _y=0; _y<20; _y++) {
    for(let _x=0; _x<5; _x++) {
        let _classes = [];
        let _z = 2;
        if(_y>12) {
            _classes = ['water-tile'];
            _z = 1;
        }
        if(!(_x == 1 && _y == 6) && !(_x == 2 && _y == 6) && !(_x == 3 && _y == 6)) MAPPING.push(new HexTile(_x, _y, _z, _classes));
    }
}

function start() {
    HexTiler.draw(ELEMENT, MAPPING);
}

start();