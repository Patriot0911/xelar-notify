FROM rabbitmq:3-management-alpine

COPY init-users.sh /etc/rabbitmq/init-users.sh
RUN chmod +x /etc/rabbitmq/init-users.sh

CMD ["/bin/sh", "-c", "rabbitmq-server & /etc/rabbitmq/init-users.sh && wait"]