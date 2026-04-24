#!/bin/sh
set -e

until rabbitmqctl await_startup 2>/dev/null; do
  echo "Waiting for RabbitMQ..."
  sleep 2
done

echo "Creating users..."

create_user() {
  local user=$1
  local password=$2
  local configure=$3
  local write=$4
  local read=$5

  rabbitmqctl add_user "$user" "$password" 2>/dev/null \
    && echo "User $user created" \
    || echo "User $user already exists, skipping"

  rabbitmqctl set_permissions -p "$RABBIT_VHOST" "$user" "$configure" "$write" "$read"
}

create_user "$RECEIVER_USER" "$RECEIVER_PASSWORD" ""   "stream\.events"        ""
create_user "$API_USER"      "$API_PASSWORD"      ".*" ".*"                    ".*"
create_user "$DISCORD_USER"  "$DISCORD_PASSWORD"  ""   ""                      "notification\.discord"
create_user "$TELEGRAM_USER" "$TELEGRAM_PASSWORD" ""   ""                      "notification\.telegram"

echo "Users created successfully"