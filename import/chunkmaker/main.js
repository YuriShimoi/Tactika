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