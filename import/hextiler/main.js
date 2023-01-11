class HexTiler {
    static config = {
        'scale': 20,
        'step_height': 1
    };

    /** Draw every non drawed tiles
     * @param {HTMLElement} _element - Parent element
     * @param {[HexTile]}   _mapping - Array of Tile instances
     */
    static draw(_element, _mapping) {
        for(let _tile of _mapping) {
            if(!HexTiler.existTile(_element, _tile)) {
                HexTiler.drawTile(_element, _tile);
            }
        }
    }

    /** Draw one unique tile
     * @param {HexTile} _tile - Tile instance that will be draw
     */
    static drawTile(_element, _tile) {
        let containerHTML = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        containerHTML.id = `hxt-tile-${_tile.id}`;
        containerHTML.classList.add("hxt-tile", ..._tile.classes);

        let tile_height = _tile.z * HexTiler.config.step_height;
        containerHTML.setAttribute('height', (2 + tile_height) * HexTiler.config.scale);
        containerHTML.setAttribute('width' , 4 * HexTiler.config.scale);

        let even_adjust = _tile.y % 2? 3: 0; // when is an even line need an initial adjust
        let _left = (_tile.x * 6 + even_adjust) * HexTiler.config.scale;// + (_tile.x * 1);
        let _top  = (_tile.y - _tile.z) * HexTiler.config.scale;// + (_tile.y * 1);
        containerHTML.style = `z-index: ${_tile.y};margin-left: ${_left}px; margin-top: ${_top}px`;

        // total_border
        let tile_border = HexTiler.polygonFromPoints(_tile.cartesianTotal(), containerHTML);
        tile_border.classList.add("hxt-tile-border");
        // lateral
        let tile_lateral = HexTiler.polygonFromPoints(_tile.cartesianTotal(), containerHTML);
        tile_lateral.classList.add("hxt-tile-lateral");
        // floor
        let tile_floor = HexTiler.polygonFromPoints(_tile.cartesianFloor(), containerHTML);
        tile_floor.classList.add("hxt-tile-floor");

        containerHTML.appendChild(tile_border);
        containerHTML.appendChild(tile_lateral);
        containerHTML.appendChild(tile_floor);

        //#region [Shaders]
        let tile_shader_minimal = HexTiler.polygonFromPoints(_tile.cartesianShaderMinimal(), containerHTML);
        tile_shader_minimal.classList.add("hxt-tile-shadow");

        let tile_shader_top = HexTiler.polygonFromPoints(_tile.cartesianShaderTop(), containerHTML);
        tile_shader_top.classList.add("hxt-tile-shadow");

        containerHTML.appendChild(tile_shader_minimal);
        containerHTML.appendChild(tile_shader_top);
        //#endregion

        _element.appendChild(containerHTML);
    }

    /** Return if exists an given tile
     * @param {HexTile} _tile - Tile instance
     * @returns {Boolean} If exists
     */
    static existTile(_tile) {
        return Boolean(document.getElementById(`hxt-tile-${_tile.id}`));
    }

    /** Creates an SVG Polygon element from given points
     * @param {[[x,y]...]} _points - Array of cartesian positions
     * @param {SVGSVGElement} _svg - SVG instance, used only to instantiate the new polygon, can be passed
     *                               when multiple calling is necessary, that way must reduce processing usage
     *                               by not creating new instances every call. **(default: *new SVG instance*)**
     * @returns {SVGPolygonElement} SVG Polygon instance with given points
     */
    static polygonFromPoints(_points, _svg=document.createElementNS("http://www.w3.org/2000/svg", "svg")) {
        let _polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        for(let _pos of _points) {
            let _point = _svg.createSVGPoint();
            _point.x = _pos[0] * HexTiler.config.scale;
            _point.y = _pos[1] * HexTiler.config.scale;
            _polygon.points.appendItem(_point);
        }
        return _polygon;
    }
}

class HexTile {
    static _ID_INCREMENT = 0;

    static CACHE_HEIGHT_BY_POS = {};
    static CACHE_HEIGHT_BY_DIA = {};
    
    /** Tile instance use on HexTiler
     * @param {Number} _x - Horizontal position
     * @param {Number} _y - Vertical position
     * @param {Number} _z - Tile height
     * @param {[String]} _aditional_classes - Array of Tile Element aditional classes
     */
    constructor(_x, _y, _z=1, _aditional_classes=[]) {
        this.id = HexTile._ID_INCREMENT++;

        this.x = _x;
        this.y = _y;
        this.z = _z;

        this.d = _x - Math.floor(_y/2);

        this.classes = _aditional_classes;

        HexTile.CACHE_HEIGHT_BY_POS[`${_x},${_y}`] = _z;
        if(this.d in HexTile.CACHE_HEIGHT_BY_POS) HexTile.CACHE_HEIGHT_BY_POS[this.d].push([this.x, this.y, this.z]);
        else HexTile.CACHE_HEIGHT_BY_POS[this.d] = [this.x, this.y, this.z];
    }

    
    /**
     * @returns {[[x,y]...]} Array of points to form the hexagonal floor
     */
    cartesianFloor() {
        return [[1,0], [3,0], [4,1], [3,2], [1,2], [0,1], [1,0]];
    }

    /**
     * @returns  {[[x,y]...]} Array of points to form the entire tile form
     */
    cartesianTotal() {
        let _height = this.z * HexTiler.config.step_height;
        if(_height <= 0) return this.cartesianFloor();

        return [[1,0], [3,0], [4,1], [4,1+_height], [3,2+_height], [1,2+_height], [0,1+_height], [0,1], [1,0]];
    }

    /**
     * @returns  {[[x,y]...]} Array of points to form the front and right laterals shadow
     */
    cartesianShaderMinimal() {
        let _height = this.z * HexTiler.config.step_height;
        if(_height <= 0) return [];

        return [[1,2], [3,2], [4,1], [4,1+_height], [3,2+_height], [1,2+_height], [1,2]];
    }

    /**
     * @returns  {[[x,y]...]} Array of points to form the top shadow
     */
    cartesianShaderTop() {
        let top_tile_height = HexTile.CACHE_HEIGHT_BY_POS[`${this.x},${this.y-2}`];
        if(top_tile_height === undefined || top_tile_height <= this.z) return [];

        let height_diff = top_tile_height - this.z;
        let _anchor = height_diff >= 2? [3,2]: [2,1];
        
        return [[1,0], _anchor, [4,1], [3,0], [1,0]];
    }
}