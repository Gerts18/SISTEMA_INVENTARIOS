#!/usr/bin/env bash
echo "Running composer"
composer install --no-dev --working-dir=/var/www/html

echo "Building frontend assets..."
cd /var/www/html && npm ci --prefer-offline && npm run build && rm -rf node_modules

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate --force

echo "Deploy complete."
