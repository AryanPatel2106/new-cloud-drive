FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN cd auth-frontend && npm install && npm run build

EXPOSE 5000

CMD ["node", "src/index.js"]