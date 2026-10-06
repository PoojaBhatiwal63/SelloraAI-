FROM node

WORKDIR /app

# Root package.json
COPY package*.json ./

RUN npm install

# Auth package files
COPY services/ai/package*.json ./services/ai/

RUN cd services/ai && npm install

# Auth source
COPY services/ai ./services/ai

# Shared folder
COPY shared ./shared

# Auth directory
WORKDIR /app/services/ai

# TypeScript build
RUN npm run build

EXPOSE 8004

CMD ["npm", "start"]