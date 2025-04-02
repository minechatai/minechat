#!/bin/bash

SCRIPTDIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPTDIR

cp .env.local .env
npx prisma migrate dev --name init
rm -rf .env