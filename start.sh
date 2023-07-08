#!/bin/sh

set -ex
npx prisma migrate deploy
npx node prisma/seed.js
#npm run start
