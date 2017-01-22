FROM node:5.3
RUN  apt-get update && apt-get install -y -q --no-install-recommends \
    rsync vim zip unzip curl cron\
     && rm -rf /var/lib/apt/lists/*
#set crontab for current user
#COPY  cron.txt  /var/spool/cron/crontabs/root
#to verify if we need this

RUN npm install pm2 -g;
RUN echo 3;
RUN mkdir /flaper.api && \
    git clone https://github.com/sklyukin/finto.me.backend.git /finto/backend --depth 1 && echo 1 > /dev/null && \
    cd /finto/backend && npm install;
CMD cd /finto/backend && npm install  && \
  pm2 start server/server.js && \
  touch /var/log/temp.log && \
  tail -f /var/log/temp.log
