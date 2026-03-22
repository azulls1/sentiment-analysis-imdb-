FROM node:20-alpine AS build

LABEL maintainer="Samael Hernandez <shernandez@iagentek.com.mx>"
LABEL version="2.1.0"
LABEL description="IMDb Sentiment Analysis Frontend - Angular 19 with Forest Design System"

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration=production

FROM nginx:alpine

LABEL maintainer="Samael Hernandez <shernandez@iagentek.com.mx>"
LABEL version="2.1.0"
LABEL description="IMDb Sentiment Analysis Frontend - production nginx"

# Add security headers via nginx config
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Run nginx as non-root user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /var/run && \
    chown -R nginx:nginx /run

USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
