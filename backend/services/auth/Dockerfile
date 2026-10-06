FROM node

WORKDIR /app

# Root package.json
COPY package*.json ./

RUN npm install

# Auth package files
COPY services/auth/package*.json ./services/auth/

RUN cd services/auth && npm install

# Auth source
COPY services/auth ./services/auth

# Shared folder
COPY shared ./shared

# Auth directory
WORKDIR /app/services/auth

# TypeScript build
RUN npm run build

EXPOSE 8001

CMD ["npm", "start"]