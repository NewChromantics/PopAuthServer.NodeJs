# use node docker image
FROM node:latest AS node_base

RUN echo "NODE Version:" && node --version
RUN echo "NPM Version:" && npm --version

# To avoid "tzdata" asking for geographic area
ARG DEBIAN_FRONTEND=noninteractive

# docker --context should be the root directory, as we cannot use ../ and need some sibling directories
COPY ./PopAuthServer /home/PopAuthServer

# Fresh install all of all the packages in each dir
WORKDIR /home/PopAuthServer
RUN npm install

# in order to include ./Server.Js (because we can't seem to include ../ at runtime), we run in the root
WORKDIR /home
CMD [ "node", "./PopAuthServer/PopAuthServer" ]

