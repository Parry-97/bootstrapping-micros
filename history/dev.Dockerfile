FROM node:18.5.0-alpine
 
WORKDIR /usr/src/app
 
COPY package*.json ./
 
RUN npm install -g pnpm

CMD pnpm config set cache-min 9999999 && \
    pnpm install && \
    pnpm dev
