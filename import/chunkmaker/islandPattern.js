ChunkPattern.Island = class {
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
                let _z       = mapping[_y][_x]? parseHeight(height_map[_y][_x]+0.5): water_height;
                let _classes = mapping[_y][_x]? terrain_classes: water_classes;
                let _texture = mapping[_y][_x]? terrain_textures: water_textures;
                result.push(new HexTile(_x, _y, _z, _classes, _texture));
            }
        }

        return result;
    }
}