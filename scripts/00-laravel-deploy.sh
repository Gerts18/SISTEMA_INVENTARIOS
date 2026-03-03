#!/usr/bin/env bash
echo "Running composer"
composer install --no-dev --working-dir=/var/www/html

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate --force

echo "Seeding roles..."
php artisan db:seed --class=RolesAndPermissionsSeeder --force

echo "Clearing permission cache..."
php artisan permission:cache-reset

echo "Deploy complete."
