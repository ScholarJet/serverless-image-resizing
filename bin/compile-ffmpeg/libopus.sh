#!/bin/bash

# libopus

cd ${FFMPEG_SOURCES_DIR}
curl -O -L https://archive.mozilla.org/pub/opus/opus-1.2.1.tar.gz
tar xzvf opus-1.2.1.tar.gz
cd opus-1.2.1
./configure --prefix="${FFMPEG_BUILD_DIR}" --disable-shared
make
make install
