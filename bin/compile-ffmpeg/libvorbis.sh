#!/bin/bash

# libvorbis

cd ${FFMPEG_SOURCES_DIR}
curl -O -L http://downloads.xiph.org/releases/vorbis/libvorbis-1.3.5.tar.gz
tar xzvf libvorbis-1.3.5.tar.gz
cd libvorbis-1.3.5
./configure --prefix="${FFMPEG_BUILD_DIR}" --with-ogg="${FFMPEG_BUILD_DIR}" --disable-shared
make
make install
