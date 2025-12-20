FROM motiadev/motia:latest

WORKDIR /app

# Node deps
COPY package*.json ./
RUN npm ci --only=production

# App source
COPY . .

# Python steps support
RUN npx motia@latest install

EXPOSE 3000

CMD ["npm", "run", "start"]
