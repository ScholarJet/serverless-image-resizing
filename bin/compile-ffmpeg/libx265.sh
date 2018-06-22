#!/bin/bash

# libx265

cd ${FFMPEG_SOURCES_DIR}
hg clone https://bitbucket.org/multicoreware/x265
cd ${FFMPEG_SOURCES_DIR}/x265/build/linux
cmake -G "Unix Makefiles" -DCMAKE_INSTALL_PREFIX="${FFMPEG_BUILD_DIR}" -DENABLE_SHARED:bool=off ../../source
make
make install
