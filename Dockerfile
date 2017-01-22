FROM node:7.4
RUN  apt-get update && apt-get install -y -q --no-install-recommends \
    vim curl\
     && rm -rf /var/lib/apt/lists/*

RUN npm install pm2 -g;
# inc to add update from git to build
RUN echo 0 > /dev/null;
RUN git clone https://github.com/sklyukin/finto.me.backend.git /finto/backend --depth 1 && \
    cd /finto/backend && npm install;
WORKDIR /finto/backend;
CMD git pull &&\
  cp /config/fintome/api/* . -r 2>/dev/null ; \
  cd /finto/backend && npm install  && \
  pm2 start server/server.js && \
  touch /var/log/temp.log && \
  tail -f /var/log/temp.log
