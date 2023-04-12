FROM node:18.5.0-alpine
WORKDIR /usr/src/app
COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install -P

COPY ./src ./src
COPY ./videos ./videos

CMD pnpm start
