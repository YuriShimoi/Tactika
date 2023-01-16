const ELEMENT = document.getElementById("main");

let DEFAULT_TEXTURE = ["img/floor.png", "img/lateral.png"];
let MAPPING = [new HexTile(1, 6, 10, [], DEFAULT_TEXTURE), new HexTile(2, 6, 9, [], DEFAULT_TEXTURE), new HexTile(3, 6, 8, [], DEFAULT_TEXTURE)];

for(let _y=0; _y<20; _y++) {
    for(let _x=0; _x<5; _x++) {
        let _classes = [];
        let _texture = DEFAULT_TEXTURE;
        let _z = 2;
        if(_y>12) {
            _texture = ["img/water.png","img/water.png"];
            _classes = ['water-tile'];
            _z = 1;
        }
        if(!(_x == 1 && _y == 6) && !(_x == 2 && _y == 6) && !(_x == 3 && _y == 6)) MAPPING.push(new HexTile(_x, _y, _z, _classes, _texture));
    }
}

function adjustSizes() {
    let _main   = document.getElementById("main");
    let _lowest = {'top': null, 'right': null, 'bottom':null, 'left':null};
    for(let _tile of _main.getElementsByClassName("hxt-tile")) {
        let _viewportOffset = _tile.getBoundingClientRect();

        if(_lowest.top === null || _viewportOffset.top < _lowest.top)
            _lowest.top = _viewportOffset.top;

        if(_lowest.right === null || (document.body.offsetWidth - _viewportOffset.right) < _lowest.right)
            _lowest.right = (document.body.offsetWidth - _viewportOffset.right);

        if(_lowest.bottom === null || (document.body.offsetHeight - _viewportOffset.bottom) < _lowest.bottom)
            _lowest.bottom = (document.body.offsetHeight - _viewportOffset.bottom);

        if(_lowest.left === null || _viewportOffset.left < _lowest.left)
            _lowest.left = _viewportOffset.left;
    }
    
    let _width  = document.body.offsetWidth  - (_lowest.left + _lowest.right);
    let _height = document.body.offsetHeight - (_lowest.top  + _lowest.bottom);
    _main.style.width  = `${_width}px`;
    _main.style.height = `${_height}px`;
}

function start() {
    HexTiler.draw(ELEMENT, MAPPING);
    adjustSizes();
}

start();