#!/bin/sh

until rabbitmqctl await_startup 2>/dev/null; do
  echo "Waiting for RabbitMQ..."
  sleep 2
done

echo "Creating users..."

create_user() {
  user=$1
  password=$2
  configure=$3
  write=$4
  read=$5

  existing=$(rabbitmqctl list_users | grep -w "$user")
  echo "Checking user $user: '$existing'"

  if [ -z "$existing" ]; then
    rabbitmqctl add_user "$user" "$password"
    echo "User $user created"
  else
    echo "User $user already exists, skipping"
  fi

  rabbitmqctl set_permissions -p "$RABBIT_VHOST" "$user" "$configure" "$write" "$read"
  echo "Permissions set for $user"
}

create_user "$RECEIVER_USER" "$RECEIVER_PASSWORD" ""   "stream\.events"        ""
create_user "$API_USER"      "$API_PASSWORD"      ".*" ".*"                    ".*"
create_user "$DISCORD_USER"  "$DISCORD_PASSWORD"  "notifications\.discord"  ""  "notifications\.discord"
create_user "$TELEGRAM_USER" "$TELEGRAM_PASSWORD" "notifications\.telegram" ""  "notifications\.telegram"

echo "Users created successfully"