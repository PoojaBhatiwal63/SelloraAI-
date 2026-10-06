FROM node

WORKDIR /app

# Root package.json
COPY package*.json ./

RUN npm install

# Auth package files
COPY services/order/package*.json ./services/order/

RUN cd services/order && npm install

# Auth source
COPY services/order ./services/order

# Shared folder
COPY shared ./shared

# Auth directory
WORKDIR /app/services/order

# TypeScript build
RUN npm run build

EXPOSE 8003

CMD ["npm", "start"]