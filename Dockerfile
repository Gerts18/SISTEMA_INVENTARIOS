FROM richarvey/nginx-php-fpm:latest

# Install Node.js for building Vite assets at image build time
# Enable pcntl extension required by Laravel Reverb (provides SIGINT etc.)
RUN apk add --no-cache nodejs npm && docker-php-ext-install pcntl

COPY . .

# Vite production environment variables — baked into the JS bundle at build time
ENV VITE_APP_NAME=Inventario \
    VITE_REVERB_APP_KEY=ojsknwmymd3nbgwrqbbz \
    VITE_REVERB_HOST=sistema-inventarios-deploy-latest.onrender.com \
    VITE_REVERB_PORT=443 \
    VITE_REVERB_SCHEME=https

# Build frontend assets (runs on local machine during docker build — no RAM issue)
RUN npm ci --prefer-offline && npm run build && rm -rf node_modules

# Copy Reverb supervisor config so supervisord starts it automatically
RUN mkdir -p /etc/supervisor/conf.d && cp /var/www/html/conf/supervisor/reverb.conf /etc/supervisor/conf.d/reverb.conf

# Image config
ENV SKIP_COMPOSER=1
ENV WEBROOT=/var/www/html/public
ENV PHP_ERRORS_STDERR=1
ENV RUN_SCRIPTS=1
ENV REAL_IP_HEADER=1

# Laravel config
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr

# Allow composer to run as root
ENV COMPOSER_ALLOW_SUPERUSER=1

CMD ["sh", "-c", "/var/www/html/start.sh && /start.sh"]