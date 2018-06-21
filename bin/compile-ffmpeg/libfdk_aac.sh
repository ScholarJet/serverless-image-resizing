#!/bin/bash

# LIBFDK_AAC

cd ${FFMPEG_SOURCES_DIR}
git clone --depth 1 https://github.com/mstorsjo/fdk-aac
cd fdk-aac
autoreconf -fiv
./configure --prefix="$FFMPEG_BUILD_DIR" --disable-shared
make
make install
