#!/bin/bash

# libtheora

cd ${FFMPEG_SOURCES_DIR}
curl -O -L https://ftp.osuosl.org/pub/xiph/releases/theora/libtheora-1.1.1.tar.gz
tar xzvf libtheora-1.1.1.tar.gz
cd libtheora-1.1.1
./configure --prefix="${FFMPEG_BUILD_DIR}" --with-ogg="${FFMPEG_BUILD_DIR}" --disable-shared
make
make install
