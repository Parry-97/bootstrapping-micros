FROM node:18.5.0-alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install -g pnpm
RUN pnpm install --only=production

COPY ./src ./src

CMD ["pnpm", "start"]
