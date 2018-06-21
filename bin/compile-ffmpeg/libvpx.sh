#!/bin/bash

# libvpx

cd ${FFMPEG_SOURCES_DIR}
git clone --depth 1 https://chromium.googlesource.com/webm/libvpx.git
cd libvpx
./configure --prefix="${FFMPEG_BUILD_DIR}" --disable-examples --disable-unit-tests --enable-vp9-highbitdepth --as=yasm
make
make install
