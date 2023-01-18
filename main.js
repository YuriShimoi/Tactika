const ELEMENT = document.getElementById("main");
const ANCHOR  = {'x': 0, 'y': 0, 'initial_x': null, 'initial_y': null};
const MOUSE   = {'active': false, 'origin_x': 0, 'origin_y': 0};

//#region [Testing Mapping]
let DEFAULT_TEXTURE = ["img/floor.png", "img/lateral.png"];
let MAPPING = [new HexTile(1, 6, 13, ["grass-tile"], DEFAULT_TEXTURE), new HexTile(2, 6, 3, ["grass-tile"], DEFAULT_TEXTURE), new HexTile(3, 6, 3, ["grass-tile"], DEFAULT_TEXTURE)];

for(let _y=0; _y<35; _y++) {
    for(let _x=0; _x<12; _x++) {
        let _classes = ["grass-tile"];
        let _texture = DEFAULT_TEXTURE;
        let _z = 2;
        if(_y>20) {
            _texture = ["img/water.png","img/water.png"];
            _classes = ['water-tile'];
            _z = 1;
        }
        if(!(_x == 1 && _y == 6) && !(_x == 2 && _y == 6) && !(_x == 3 && _y == 6)) MAPPING.push(new HexTile(_x, _y, _z, _classes, _texture));
    }
}
//#endregion


function centerContainer() {
    if(ANCHOR.initial_x !== null && ANCHOR.initial_y !== null) {
        setContainerPos(ANCHOR.initial_x, ANCHOR.initial_y);
    }

    const formatPxToNumber = (pxvalue) => {
        return Number(pxvalue.replace("px", "").replace(';', '').replace(' ',''));
    };

    let _tiles   = document.getElementById("main").getElementsByClassName("hxt-tile");
    let _lowest = {'top': null, 'right': null, 'bottom':null, 'left':null, 'margin': 0};
    for(let _tile of _tiles) {
        let _viewportOffset = _tile.getBoundingClientRect();

        if(_lowest.top === null || _viewportOffset.top < _lowest.top)
            _lowest.top = _viewportOffset.top;

        if(_lowest.right === null || (document.body.offsetWidth - _viewportOffset.right) < _lowest.right)
            _lowest.right = (document.body.offsetWidth - _viewportOffset.right);

        if(_lowest.bottom === null || (document.body.offsetHeight - _viewportOffset.bottom) < _lowest.bottom)
            _lowest.bottom = (document.body.offsetHeight - _viewportOffset.bottom);

        if(_lowest.left === null || _viewportOffset.left < _lowest.left)
            _lowest.left = _viewportOffset.left;

            if(formatPxToNumber(_tile.style.marginTop) < _lowest.margin) {
                _lowest.margin = formatPxToNumber(_tile.style.marginTop);
            }
    }
    
    let _top    = document.body.offsetHeight;
    let _left   = document.body.offsetWidth;
    let _width  = document.body.offsetWidth  - (_lowest.left + _lowest.right);
    let _height = document.body.offsetHeight - (_lowest.top  + _lowest.bottom);

    let _center_y = _top - (document.body.offsetHeight - _height);
    let _center_x = _left - (document.body.offsetWidth - _width);

    ANCHOR.x = -_center_x;
    ANCHOR.y = -(_center_y + (_lowest.margin*2));
    ANCHOR.initial_x = -_center_x;
    ANCHOR.initial_y = -(_center_y + (_lowest.margin*2));
    setContainerPos(ANCHOR.x, ANCHOR.y);
}

function setContainerPos(_x, _y) {
    let _main = document.getElementById("main");

    _main.style.marginTop  = `${_y}px`;
    _main.style.marginLeft = `${_x}px`;
}

function start() {
    HexTiler.draw(ELEMENT, MAPPING);
    centerContainer();

    document.body.onmousedown = (_mouse_event) => {
        MOUSE.active = true;
        MOUSE.origin_x = _mouse_event.pageX;
        MOUSE.origin_y = _mouse_event.pageY;
    };
    document.body.onmousemove = (_mouse_event) => {
        if(MOUSE.active) {
            let _move_x = (_mouse_event.pageX - MOUSE.origin_x)*2;
            let _move_y = (_mouse_event.pageY - MOUSE.origin_y)*2;
            setContainerPos(ANCHOR.x + _move_x, ANCHOR.y + _move_y);
        }
    };
    document.body.onmouseup = document.body.onmouseleave = (_mouse_event) => {
        MOUSE.active = false;

        let _move_x = (_mouse_event.pageX - MOUSE.origin_x)*2;
        let _move_y = (_mouse_event.pageY - MOUSE.origin_y)*2;

        ANCHOR.x += _move_x;
        ANCHOR.y += _move_y;
    };
}

start();