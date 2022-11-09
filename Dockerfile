FROM node:16.18-slim

RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package*.json .

RUN yarn install

COPY . .

EXPOSE 802

CMD yarn dev
