#!/bin/bash

# NASM

echo "INSTALLING NASM prefix=$FFMPEG_BUILD_DIR, bindir=$FFMPEG_BIN_DIR"

cd ${FFMPEG_SOURCES_DIR}
curl -O -L http://www.nasm.us/pub/nasm/releasebuilds/2.13.02/nasm-2.13.02.tar.bz2
tar xjvf nasm-2.13.02.tar.bz2
cd nasm-2.13.02
./autogen.sh
./configure --prefix="${FFMPEG_BUILD_DIR}" --bindir="${FFMPEG_BIN_DIR}"
make
make install

echo "NASM INSTALLED"
