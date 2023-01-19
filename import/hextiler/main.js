class HexTiler {
    static config = {
        'scale': 24,
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
        //#region [Initialization]
        let containerHTML = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        containerHTML.id = `hxt-tile-${_tile.id}`;
        containerHTML.classList.add("hxt-tile", ..._tile.classes);

        containerHTML.setAttribute('x', _tile.x);
        containerHTML.setAttribute('y', _tile.y);
        containerHTML.setAttribute('z', _tile.z);
        containerHTML.setAttribute('s1', _tile.s1);
        containerHTML.setAttribute('s2', _tile.s2);
        containerHTML.setAttribute('s3', _tile.s3);
        containerHTML.setAttribute('v1', _tile.v1);
        containerHTML.setAttribute('v2', _tile.v2);

        let tile_height = _tile.z * HexTiler.config.step_height;
        containerHTML.setAttribute('height', (2 + tile_height) * HexTiler.config.scale);
        containerHTML.setAttribute('width' , 4 * HexTiler.config.scale);

        let even_adjust = _tile.y % 2? 3: 0; // when is an even line need an initial adjust
        let _left = (_tile.x * 6 + even_adjust) * HexTiler.config.scale;// + (_tile.x * 1);
        let _top  = (_tile.y - _tile.z) * HexTiler.config.scale;// + (_tile.y * 1);
        containerHTML.style = `z-index: ${_tile.y};margin-left: ${_left}px; margin-top: ${_top}px`;
        //#endregion

        //#region [Polygon]
        // total_collision
        let tile_collision = HexTiler.polygonFromPoints(_tile.cartesianTotal(), containerHTML);
        tile_collision.classList.add("hxt-tile-collision");
        // lateral
        let tile_lateral = HexTiler.polygonFromPoints(_tile.cartesianTotal(), containerHTML);
        tile_lateral.classList.add("hxt-tile-lateral");
        // floor
        let tile_floor = HexTiler.polygonFromPoints(_tile.cartesianFloor(), containerHTML);
        tile_floor.classList.add("hxt-tile-floor");
        // total_border
        let tile_border = HexTiler.polygonFromPoints(_tile.cartesianBorder(), containerHTML);
        tile_border.classList.add("hxt-tile-border");

        containerHTML.appendChild(tile_collision);

        if(_tile.texture[1]) {
            let [_mask, _image] = HexTiler.maskPolygon(`tile-lateral-${_tile.id}`, _tile.texture[1]);
            _mask.appendChild(tile_lateral);
            containerHTML.appendChild(_mask);
            containerHTML.appendChild(_image);
        }
        else {
            containerHTML.appendChild(tile_lateral);
        }
        if(_tile.texture[0]) {
            let [_mask, _image] = HexTiler.maskPolygon(`tile-floor-${_tile.id}`, _tile.texture[0]);
            _mask.appendChild(tile_floor);
            containerHTML.appendChild(_mask);
            containerHTML.appendChild(_image);
        }
        else {
            containerHTML.appendChild(tile_floor);
        }
        //#endregion

        //#region [Shaders]
        let tile_shader_minimal = HexTiler.polygonFromPoints(_tile.cartesianShaderMinimal(), containerHTML);
        tile_shader_minimal.classList.add("hxt-tile-shadow");

        let tile_shader_top = HexTiler.polygonFromPoints(_tile.cartesianShaderTop(), containerHTML);
        tile_shader_top.classList.add("hxt-tile-shadow");

        containerHTML.appendChild(tile_shader_minimal);
        containerHTML.appendChild(tile_shader_top);
        //#endregion

        // Must be last added to overide everything
        containerHTML.appendChild(tile_border);

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

    static maskPolygon(_id, _texture) {
        let maskContainer = document.createElementNS("http://www.w3.org/2000/svg", "mask");
        maskContainer.id = _id;

        let maskImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        maskImage.setAttribute("mask", `url(#${_id})`);
        maskImage.setAttribute("href", _texture);
        maskImage.style.width = `${HexTiler.config.scale * 4}px`;

        return [maskContainer, maskImage];
    }
}

class HexTile {
    static _ID_INCREMENT = 0;

    // cache by {x,y} position > format: `${_x},${_y}`
    static CACHE_HEIGHT_BY_POS = {};
    // cache by the 3 hexagon sides
    static CACHE_HEIGHT_BY_SID = {'s1': {}, 's2': {}, 's3': {}};
    // cache by the 2 hexagon diagonal vertices, since horizontal one is this.x
    static CACHE_HEIGHT_BY_VTX = {'v1': {}, 'v2': {}};
    
    /** Tile instance use on HexTiler
     * @param {Number} _x - Horizontal position
     * @param {Number} _y - Vertical position
     * @param {Number} _z - Tile height
     * @param {[String]} _aditional_classes - Array of Tile Element aditional classes
     */
    constructor(_x, _y, _z=1, _aditional_classes=[], _textures=["",""]) {
        this.id = HexTile._ID_INCREMENT++;

        this.x = _x;
        this.y = _y;
        this.z = _z;

        this.classes = _aditional_classes;
        this.texture = _textures;

        this.s1 = _x - Math.floor(_y/2);
        this.s2 = (_x * 2) + (_y % 2);
        this.s3 = _x + Math.ceil(_y/2);
        
        if(this.s1 in HexTile.CACHE_HEIGHT_BY_SID.s1) HexTile.CACHE_HEIGHT_BY_SID.s1[String(this.s1)].push([_x, _y, _z]);
        else HexTile.CACHE_HEIGHT_BY_SID.s1[String(this.s1)] = [[_x, _y, _z]];
        if(this.s2 in HexTile.CACHE_HEIGHT_BY_SID.s2) HexTile.CACHE_HEIGHT_BY_SID.s2[String(this.s2)].push([_x, _y, _z]);
        else HexTile.CACHE_HEIGHT_BY_SID.s2[String(this.s2)] = [[_x, _y, _z]];
        if(this.s3 in HexTile.CACHE_HEIGHT_BY_SID.s3) HexTile.CACHE_HEIGHT_BY_SID.s3[String(this.s3)].push([_x, _y, _z]);
        else HexTile.CACHE_HEIGHT_BY_SID.s3[String(this.s3)] = [[_x, _y, _z]];

        this.v1 = parseFloat(parseFloat((2*_x) - (_y%2 == 1? (_y/3)-1: _y/3)).toFixed(1));
        this.v2 = parseFloat(parseFloat((2*_x) + (_y%2 == 1? (_y/3)+1: _y/3)).toFixed(1));

        if(this.v1 in HexTile.CACHE_HEIGHT_BY_VTX.v1) HexTile.CACHE_HEIGHT_BY_VTX.v1[String(this.v1)].push([_x, _y, _z]);
        else HexTile.CACHE_HEIGHT_BY_VTX.v1[String(this.v1)] = [[_x, _y, _z]];
        if(this.v2 in HexTile.CACHE_HEIGHT_BY_VTX.v2) HexTile.CACHE_HEIGHT_BY_VTX.v2[String(this.v2)].push([_x, _y, _z]);
        else HexTile.CACHE_HEIGHT_BY_VTX.v2[String(this.v2)] = [[_x, _y, _z]];

        
        HexTile.CACHE_HEIGHT_BY_POS[`${_x},${_y}`] = [_z, this.s1, this.s2, this.s3, this.v1, this.v2];
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
     * @returns  {[[x,y]...]} Array of points to form the entire tile bordering
     */
    cartesianBorder() {
        let _height = this.z * HexTiler.config.step_height;
        if(_height <= 0) return this.cartesianFloor();

        return [[0,1], [1,0], [3,0], [4,1], [4,1+_height], [3,2+_height], [1,2+_height], [0,1+_height], [0,1], [1,2], [3,2], [4,1], [3,0], [1,0]];
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
        const calc_v1_height = (_v1, _y, _z, max_height=2) => {
            let _height = 0;
            for(let _tile of HexTile.CACHE_HEIGHT_BY_VTX.v1[_v1]) {
                if((_tile[1] <_y) && (_tile[2] >_z)) {
                    // calc diff
                    let _tile_diff = (_tile[2] -_z) - ((_y - _tile[1]) - 2);
                    if(_tile_diff > _height) _height = _tile_diff;
                    if(_height >= max_height) break;
                }
            }
            return _height;
        };

        let shadow_map = [0,0,0,0,0,0];

        //#region [Top Tile]
        let _top_tile = HexTile.CACHE_HEIGHT_BY_POS[`${this.x},${this.y-2}`] || false;
        if(_top_tile) {
            let top_tile_height = _top_tile[0];
            let top_height_diff = top_tile_height - this.z;
            
            let v1_top_height = calc_v1_height(_top_tile[4], this.y-2, this.z, 4) - 2;
            if(v1_top_height > top_height_diff) top_height_diff = v1_top_height;
            
            if(top_height_diff > 0) {
                shadow_map[0] = 1;
                shadow_map[1] = 1;
                if(top_height_diff >= 2) shadow_map[2] = 1;
            }
        }
        //#endregion

        //#region [S1 first tile]
        let _sid_tile = HexTile.CACHE_HEIGHT_BY_POS[`${this.y%2?this.x: this.x-1},${this.y-1}`] || false;
        if(_sid_tile) {
            let sid_tile_height = _sid_tile[0];
            let sid_height_diff = sid_tile_height - this.z;
            
            let v1_sid_height = calc_v1_height(_sid_tile[4], this.y-1, this.z, 4) - 2;
            if(v1_sid_height > sid_height_diff) sid_height_diff = v1_sid_height;
    
            if(sid_height_diff > 0) {
                shadow_map[5] = 1;
                shadow_map[4] = 1;
                if(sid_height_diff >= 2) shadow_map[3] = 1;
            }
        }
        //#endregion
        
        //#region [V1 Tiles]
        let sid_height_vtx = calc_v1_height(this.v1, this.y, this.z);
        if(sid_height_vtx > 0) {
            if(sid_height_vtx >= 2) shadow_map = [1,1,1,1,1,1];
            else {
                shadow_map[0] = 1;
                shadow_map[5] = 1;
            }
        }
        //#endregion

        //#region [Shadow Mapping]
        let _result   = [];
        let _refcord  = [[3,0], [4,1], [3,2], [1,2], [0,1], [1,0]];
        let _centered = false;
        for(let sm in shadow_map) {
            if(shadow_map[sm]) {
                if(_result.length == 0) _result = [[1,0]];
                if(_centered) _result.push(_refcord[sm-1]);
                _result.push(_refcord[sm]);
                _centered = false;
            }
            else if(!_centered) {
                _result.push([2,1]); // center
                _centered = true;
            }
        }
        if(_result.length == 1) _result = [];
        else _result.push([..._result[_result.length-1]]);
        //#endregion

        return _result;
    }
}