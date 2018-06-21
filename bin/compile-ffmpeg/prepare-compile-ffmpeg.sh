#!/usr/bin/env bash

# Written following guide from https://trac.ffmpeg.org/wiki/CompilationGuide/Centos



export FFMPEG_WORKING_DIR=/tmp
mkdir -p ${FFMPEG_WORKING_DIR}/ffmpeg_sources ${FFMPEG_WORKING_DIR}/ffmpeg_build ${FFMPEG_WORKING_DIR}/bin
export FFMPEG_SOURCES_DIR=${FFMPEG_WORKING_DIR}/ffmpeg_sources
export FFMPEG_BUILD_DIR=${FFMPEG_WORKING_DIR}/ffmpeg_build
export FFMPEG_BIN_DIR=${FFMPEG_WORKING_DIR}/bin

ls -l
./nasm.sh | sed "s/^/[build-nasm] /"
./yasm.sh | sed "s/^/[build-yasm] /"
./libx264.sh | sed "s/^/[build-libx264] /"
./libx265.sh | sed "s/^/[build-libx265] /"
./libfdk_aac.sh | sed "s/^/[build-libfdk_aac] /"
./libmp3lame.sh | sed "s/^/[build-libmp3lame] /"
./libopus.sh | sed "s/^/[build-libopus] /"
./libogg.sh | sed "s/^/[build-libogg] /"
./libvorbis.sh | sed "s/^/[build-libvorbis] /"
./libtheora.sh | sed "s/^/[build-libtheora] /"
./libvpx.sh | sed "s/^/[build-libvpx] /"
./ffmpeg.sh | sed "s/^/[build-ffmpeg] /"
