#!/bin/bash

# YASM

cd ${FFMPEG_SOURCES_DIR}
curl -O -L http://www.tortall.net/projects/yasm/releases/yasm-1.3.0.tar.gz
tar xzvf yasm-1.3.0.tar.gz
cd yasm-1.3.0
./configure --prefix="${FFMPEG_BUILD_DIR}" --bindir="${FFMPEG_BIN_DIR}"
make
make install
