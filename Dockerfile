FROM amazonlinux

ADD etc/nodesource.gpg.key /etc

WORKDIR /tmp

RUN yum -y install gcc-c++ && \
    rpm --import /etc/nodesource.gpg.key && \
    curl --location --output ns.rpm https://rpm.nodesource.com/pub_6.x/el/7/x86_64/nodejs-6.10.1-1nodesource.el7.centos.x86_64.rpm && \
    rpm --checksig ns.rpm && \
    rpm --install --force ns.rpm && \
    npm install -g npm@latest && \
    npm cache clean --force && \
    yum clean all && \
    rm --force ns.rpm

# Get mediainfo

RUN yum -y groupinstall 'Development Tools'
RUN yum -y install libcurl-devel

RUN curl -O http://mediaarea.net/download/binary/mediainfo/0.7.84/MediaInfo_CLI_0.7.84_GNU_FromSource.tar.xz

RUN tar xvf MediaInfo_CLI_0.7.84_GNU_FromSource.tar.xz

RUN cd MediaInfo_CLI_GNU_FromSource && \
    ./CLI_Compile.sh --with-libcurl

WORKDIR /build
