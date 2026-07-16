#!/bin/bash
git pull

npm install

npx prisma generate
 
rm -rf dist

npx tsc

pm2 start ecosystem.config.cjs --env production

pm2 save

cd frontend

npm install

rm -rf dist

npm run build

sudo rm -rf /var/www/helpdesk

sudo cp -r dist /var/www/helpdesk

sudo chown -R www-data:www-data /var/www/helpdesk

cd ..

sudo systemctl reload nginx
