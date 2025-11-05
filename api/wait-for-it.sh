#!/usr/bin/env bash
#   usage: wait-for-it.sh host:port [-t timeout] [-- command args]
#   example: ./wait-for-it.sh mysql:3306 -- echo "MySQL is up"

set -e

HOSTPORT=$1
shift
TIMEOUT=15

# Parse host:port
HOST=$(echo $HOSTPORT | cut -d: -f1)
PORT=$(echo $HOSTPORT | cut -d: -f2)

echo "Waiting for $HOST:$PORT..."

for i in $(seq $TIMEOUT); do
  nc -z $HOST $PORT >/dev/null 2>&1 && break
  echo "Waiting... ($i/$TIMEOUT)"
  sleep 1
done

# run the command after --
exec "$@"
