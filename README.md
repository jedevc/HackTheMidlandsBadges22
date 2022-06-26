# HTM badge prototype

## Development

Build using containerized environment:

    docker buildx bake

The results will be output to the `build/` directory. If you have a python3
installation, you can easily spin up a localhost server:

    (cd build && python3 -m http.server)
