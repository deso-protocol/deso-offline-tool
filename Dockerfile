FROM node:18.12.0-alpine3.15 AS frontend

WORKDIR /frontend

RUN apk add git
RUN apk add zip
RUN apk add sed

COPY ./package.json .
COPY ./package-lock.json .

# install frontend dependencies before copying the frontend code
# into the container so we get docker cache benefits
RUN npm install

COPY ./tailwind.config.js .
COPY ./tsconfig.json .
COPY ./src ./src
COPY ./nginx.conf .

RUN npm run build

FROM nginx:1.17

COPY --from=frontend frontend/dist/ /usr/share/nginx/html
COPY --from=frontend frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
