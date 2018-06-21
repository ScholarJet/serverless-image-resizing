#!/bin/bash

cd ${FFMPEG_SOURCES_DIR}
curl -O -L https://ffmpeg.org/releases/ffmpeg-snapshot.tar.bz2
tar xjvf ffmpeg-snapshot.tar.bz2
cd ffmpeg
PATH="$FFMPEG_BIN_DIR:$PATH" PKG_CONFIG_PATH="${FFMPEG_BUILD_DIR}/lib/pkgconfig" ./configure \
  --prefix="$FFMPEG_BUILD_DIR" \
  --pkg-config-flags="--static" \
  --extra-cflags="-I$FFMPEG_BUILD_DIR/include" \
  --extra-ldflags="-L$FFMPEG_BUILD_DIR/lib" \
  --extra-libs=-lpthread \
  --extra-libs=-lm \
  --bindir="$FFMPEG_BIN_DIR" \
  --enable-gpl \
  --enable-libfdk_aac \
  --enable-libfreetype \
  --enable-libmp3lame \
  --enable-libopus \
  --enable-libvorbis \
  --enable-libtheora \
  --enable-libvpx \
  --enable-libx264 \
  --enable-libx265 \
  --enable-nonfree
make
make install
hash -r
