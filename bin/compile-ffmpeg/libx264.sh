#!/bin/bash

# LIBX264

cd ${FFMPEG_SOURCES_DIR}
git clone --depth 1 http://git.videolan.org/git/x264
cd x264
PKG_CONFIG_PATH="${FFMPEG_BUILD_DIR}/lib/pkgconfig" ./configure --prefix="${FFMPEG_BUILD_DIR}" --bindir="${FFMPEG_BIN_DIR}" --enable-static
make
make install
