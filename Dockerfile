# -----------------------------
# Stage 1: Composer dependencies
# -----------------------------
FROM composer:2.7 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --ignore-platform-reqs \
    --no-scripts


# -----------------------------
# Stage 2: PHP-FPM
# -----------------------------
FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libzip-dev \
    libonig-dev \
    zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    bcmath \
    gd \
    zip

RUN pecl install redis \
    && docker-php-ext-enable redis

WORKDIR /var/www

COPY --from=vendor /app/vendor ./vendor

COPY --chown=www-data:www-data . .

RUN chown -R www-data:www-data \
        /var/www/storage \
        /var/www/bootstrap/cache \
    && chmod -R 775 \
        /var/www/storage \
        /var/www/bootstrap/cache

USER www-data

EXPOSE 9000

CMD ["php-fpm"]
