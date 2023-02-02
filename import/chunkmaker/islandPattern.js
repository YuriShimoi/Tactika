ChunkPattern.Island = class {
    /** Map an Island like hexagonal mapping considering ChunkPattern.settings
     * @param {String[]} terrain_classes - List of classes that can be added to the tile
     * @param {String[]} terrain_textures - Bidimension array with top and lateral textures
     * @param {String[]} water_classes - List of classes that can be added to the tile
     * @param {String[]} water_textures - Bidimension array with top and lateral textures
     * @param {Number} water_height - Default height from water, if above 0 water will not be filled **(default: 1)**
     * @returns {HexTile[]} HexTile mapping array.
     */
    static generate(terrain_classes, terrain_textures, water_classes, water_textures, water_height=1) {
        const _settings = ChunkPattern.settings;
        const parseHeight = height => Math.round((height * (_settings.max_height - _settings.min_height)) + _settings.min_height);

        let mapping = ChunkBlob.generate(
            _settings.radius, _settings.density,
            _settings.spacing, _settings.iterations
        );

        if(_settings.do_strip) {
            mapping = ChunkBlob.stripeHorizontal(mapping,
                _settings.strip_jump_size, _settings.strip_size
            );
        }
        
        // using perlin noise from external library
        GridProcedure.prop.perlin.frequency = 8;
        let height_map = GridProcedure.generate('perlin', {'x': mapping.length, 'y': mapping[0].length});

        let result = [];
        for(let _y in mapping) {
            _y = Number(_y);
            for(let _x in mapping[_y]) {
                _x = Number(_x);
                let isTerrain = mapping[_y][_x];
                if(isTerrain) {
                    let _z       = parseHeight(height_map[_y][_x]+0.5);
                    let _classes = terrain_classes;
                    let _texture = terrain_textures;
                    result.push(new HexTile(_x, _y, _z, _classes, _texture));
                }
                else if(water_height >= 0) {
                    let _z       = water_height;
                    let _classes = water_classes;
                    let _texture = water_textures;
                    result.push(new HexTile(_x, _y, _z, _classes, _texture));
                }
            }
        }

        return result;
    }
}