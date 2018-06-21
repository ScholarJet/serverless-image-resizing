FROM amazonlinux:2017.12.0.20180222-with-sources

ADD etc/nodesource.gpg.key /etc

WORKDIR /tmp

RUN yum -y update

RUN yum -y install gcc-c++ && \
    rpm --import /etc/nodesource.gpg.key && \
    curl --location --output ns.rpm https://rpm.nodesource.com/pub_6.x/el/7/x86_64/nodejs-6.10.1-1nodesource.el7.centos.x86_64.rpm && \
    rpm --checksig ns.rpm && \
    rpm --install --force ns.rpm && \
    npm install -g npm@latest && \
    npm cache clean --force && \
    yum clean all && \
    rm --force ns.rpm

#RUN yum -y install bzip2
#RUN yum -y remove nasm && hash -r
#RUN yum -y install autoconf automake bzip2 cmake freetype-devel gcc gcc-c++ git libtool make mercurial pkgconfig zlib-devel
#
#COPY bin/compile-ffmpeg /tmp/compile-ffmpeg
#
#ENV FFMPEG_WORKING_DIR /tmp/compile_ffmpeg
#ENV FFMPEG_SOURCES_DIR $FFMPEG_WORKING_DIR/ffmpeg_sources
#ENV FFMPEG_BUILD_DIR $FFMPEG_WORKING_DIR/ffmpeg_build
#ENV FFMPEG_BIN_DIR $FFMPEG_WORKING_DIR/bin
#
#RUN PATH="$FFMPEG_BIN_DIR:$PATH"
#RUN echo $PATH
#
#RUN mkdir -p $FFMPEG_SOURCES_DIR $FFMPEG_BUILD_DIR $FFMPEG_BIN_DIR
#
#RUN cd /tmp/compile-ffmpeg && ./nasm.sh | sed "s/^/[build-nasm] /"
#RUN cd /tmp/compile-ffmpeg && ./yasm.sh | sed "s/^/[build-yasm] /"
#RUN cd /tmp/compile-ffmpeg && ./libx264.sh | sed "s/^/[build-libx264] /"
#RUN cd /tmp/compile-ffmpeg && ./libx265.sh | sed "s/^/[build-libx265] /"
#RUN cd /tmp/compile-ffmpeg && ./libfdk_aac.sh | sed "s/^/[build-libfdk_aac] /"
#RUN cd /tmp/compile-ffmpeg && ./libmp3lame.sh | sed "s/^/[build-libmp3lame] /"
#RUN cd /tmp/compile-ffmpeg && ./libopus.sh | sed "s/^/[build-libopus] /"
#RUN cd /tmp/compile-ffmpeg && ./libogg.sh | sed "s/^/[build-libogg] /"
#RUN cd /tmp/compile-ffmpeg && ./libvorbis.sh | sed "s/^/[build-libvorbis] /"
#RUN cd /tmp/compile-ffmpeg && ./libtheora.sh | sed "s/^/[build-libtheora] /"
#RUN cd /tmp/compile-ffmpeg && ./libvpx.sh | sed "s/^/[build-libvpx] /"
#RUN cd /tmp/compile-ffmpeg && ./ffmpeg.sh | sed "s/^/[build-ffmpeg] /"

## Get mediainfo
#RUN yum -y groups mark install "Development Tools"
#RUN yum -y groups mark convert "Development Tools"
RUN yum -y groupinstall 'Development Tools'
RUN yum install libcurl-devel -y && echo "installed libcurl"

RUN curl -O https://mediaarea.net/download/binary/mediainfo/0.7.84/MediaInfo_CLI_0.7.84_GNU_FromSource.tar.xz

RUN tar xvf MediaInfo_CLI_0.7.84_GNU_FromSource.tar.xz

RUN cd MediaInfo_CLI_GNU_FromSource && \
    ./CLI_Compile.sh --with-libcurl && echo done3

WORKDIR /build
