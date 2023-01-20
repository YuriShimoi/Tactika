class ChunkBlob {
    static FILL_CHAR  = 1;
    static EMPTY_CHAR = 0;

    static generate(_radius, _density=0.6, _spacing=1, _iterations=5, _fill=ChunkBlob.FILL_CHAR, _empty=ChunkBlob.EMPTY_CHAR) {
        let _mapping = ChunkBlob.circle(_radius, _density, _spacing, _fill, _empty);
        
        return ChunkBlob.processCellular(_mapping, _iterations, _empty);
    }

    static circle(_radius, _density=1, _spacing=0, _fill=ChunkBlob.FILL_CHAR, _empty=ChunkBlob.EMPTY_CHAR) {
        let _mapping = new Array((_radius+_spacing)*2+1).fill().map(_ => new Array((_radius+_spacing)*2+1).fill(_empty));
        for(let _y=_spacing; _y < (_mapping.length-_spacing); _y++) {
            for(let _x=_spacing; _x < (_mapping[_y].length-_spacing); _x++) {
                if(Math.ceil(Math.sqrt((_x-_radius)**2 + (_y-_radius)**2)-0.3) <= _radius) {
                    if(_density >= 1 || Math.random() <= _density) _mapping[_x][_y] = _fill;
                }
            }
        }
        return _mapping;
    }

    static processCellular(_mapping, _iterations=1, _empty=ChunkBlob.EMPTY_CHAR, _empty_tolerance=7/8) {
        const randomList = _length => {
            let _list = new Array(_length).fill().map((_,i) => i);
            for(let i in _list) {
                let r = Math.round(Math.random() * (_list.length-1));
                [_list[i], _list[r]] = [_list[r], _list[i]];
            }
            return _list;
        };
        const isValidPos = (_x, _y) => _y >= 0 && _y < _mapping.length && _x >= 0 && _x < _mapping[_y].length;
        const mostRepeat = (_map, _center=null) => {
            let _most_value = null;
            let _most_times = 0;
            for(let c of _map) {
                let _times = _map.filter(m => m === c).length;
                if((_times+(_center === c? 1:0)) > _most_times) {
                    _most_times = _times;
                    _most_value = c;
                }
            }
            return _most_value;
        };
        
        for(let i=0; i < _iterations; i++) {
            let _map_y = randomList(_mapping.length);
            for(let _y of _map_y) {
                let _map_x = randomList(_mapping[_y].length);
                for(let _x of _map_x) {
                    let _map = [];

                    if(isValidPos(_x-1, _y-1)) _map.push(_mapping[_y-1][_x-1]);
                    if(isValidPos(_x-1, _y  )) _map.push(_mapping[_y  ][_x-1]);
                    if(isValidPos(_x-1, _y+1)) _map.push(_mapping[_y+1][_x-1]);
                    if(isValidPos(_x  , _y-1)) _map.push(_mapping[_y-1][_x  ]);
                    if(isValidPos(_x  , _y+1)) _map.push(_mapping[_y+1][_x  ]);
                    if(isValidPos(_x+1, _y-1)) _map.push(_mapping[_y-1][_x+1]);
                    if(isValidPos(_x+1, _y  )) _map.push(_mapping[_y  ][_x+1]);
                    if(isValidPos(_x+1, _y+1)) _map.push(_mapping[_y+1][_x+1]);

                    if(_mapping[_y][_x] === _empty) {
                        if((_map.filter(m => m === _empty).length/_map.length) >= _empty_tolerance) {
                            _mapping[_y][_x] = _empty;
                        }
                        else {
                            _mapping[_y][_x] = mostRepeat(_map, _mapping[_y][_x]);
                        }
                    }
                    else if((_map.filter(m => m === _mapping[_y][_x]).length/_map.length) < (1 - _empty_tolerance)) {
                        _mapping[_y][_x] = mostRepeat(_map, _mapping[_y][_x]);
                    }
                }
            }
        }
        return _mapping;
    }

    static stripeHorizontal(_mapping, _jump_size=1, _strip_size=1) {
        for(let _y in _mapping) {
            for(let _x=1; _x < _mapping[_y].length; _x+=_jump_size) {
                _mapping[_y].splice(_x, _strip_size);
            }
        }
        return _mapping;
    }
}



//#region [Generation by shape, abandoned for now]
class ChunkShape {
    /** Return an format configuration
     * @returns {[ChunkShapeDot]} Array of dots configuration
     */
    static format = {
        /** 
         * @param {Number} _w - Width of the square
         * @param {Number} _h - Height of the square
         */
        'square' : (_w, _h) => ChunkShape.polyToFormat([[0,0], [_w,0],[_w,_h],[0,_h]]),
        /**
         * @param {Number} _r - Base radius
         */
        'circle' : (_r)     => ChunkShape.polyToFormat([], _r),
        /**
         * @param {[[x,y]...]} _dots - Array of coordinates to form the polygon
         */
        'polygon': (_dots)  => ChunkShape.polyToFormat(_dots)
    };

    constructor(_form) {
        this.form = _form;

        // convert radius to set of dots
        this.mapping = this.convertFormToMap();

        // poly infill with base form
        let _infill = this.polyInfill();

        // merge with poly infil
        this.mergeDots(_infill);
    }

    /** Convert an array of positions to an array of ChunkShapeDot format like
     * @param {[[x,y]...]} _dots - Array of positions
     * @param {Number} _dr - Dots radius **(default: null, *half distance between dots*)**
     * @param {Number} _mr - Minimal radius **(default: 5)**
     * @returns {[ChunkShapeDot]} Array of dots configuration
     */
    static polyToFormat(_dots, _dr=null, _mr=5) {
        const getLastDot = i => _dots[i-1 < 0? _dots.length-1: i-1];

        if(_dots.length <= 1) _dots = [0,0];

        let result_dots = [];
        for(let d in _dots) {
            let new_dot  = new ChunkShape.ChunkShapeDot(_dots[d][0], _dots[d][1]);
            let last_dot = getLastDot(d);
            new_dot.setRandRadius(new_dot.distanceTo(last_dot[0], last_dot[1])/2, _mr);
            result_dots.push(new_dot);
        }

        return result_dots;
    }

    /** Get this.form and return an mapping converting dots radius as positions
     * @returns {[[x,y]...]} Array of positions
     */
    convertFormToMap() {
        // TODO
    }

    /** Returns the infill mapping from this.form
     * @returns {[[x,y]...]} Array of positions
     */
    polyInfill() {
        // TODO
    }

    /** Merge given map with this.mapping, remove duplicates
     * @returns {[[x,y]...]} Array of positions
     */
    mergeDots(_map) {
        // TODO
    }


    /** Shape dots class to support some properties */
    static ChunkShapeDot = class {
        constructor(_x, _y, _r=1) {
            this.x = _x;
            this.y = _y;
            this.r = _r;
        }

        distanceTo(_x, _y) {
            return Math.round(Math.sqrt(Math.abs(this.x-_x)**2 + Math.abs(this.y - _y)**2));
        }

        setRandRadius(_max, _min) {
            if(_min >= _max)
                this.r = _min;
            else
                this.r = Math.round((Math.random() * (_max - _min)) + _min);
            
            return this.r;
        }
    }
}
//#endregion