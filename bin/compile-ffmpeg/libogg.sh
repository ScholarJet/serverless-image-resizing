#!/bin/bash

# LIBOGG

cd ${FFMPEG_SOURCES_DIR}
curl -O -L http://downloads.xiph.org/releases/ogg/libogg-1.3.3.tar.gz
tar xzvf libogg-1.3.3.tar.gz
cd libogg-1.3.3
./configure --prefix="${FFMPEG_BUILD_DIR}" --disable-shared
make
make install
