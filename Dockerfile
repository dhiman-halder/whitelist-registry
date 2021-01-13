FROM node:12.13.0
WORKDIR /usr/src/app
COPY app/package*.json ./
RUN npm install
COPY app .
EXPOSE 8443
USER 1000:1000
CMD [ "npm", "start" ]