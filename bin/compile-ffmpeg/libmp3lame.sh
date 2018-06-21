#!/bin/bash

# libmp3lame

cd ${FFMPEG_SOURCES_DIR}
curl -O -L http://downloads.sourceforge.net/project/lame/lame/3.100/lame-3.100.tar.gz
tar xzvf lame-3.100.tar.gz
cd lame-3.100
./configure --prefix="${FFMPEG_BUILD_DIR}" --bindir="${FFMPEG_BIN_DIR}" --disable-shared --enable-nasm
make
make install
