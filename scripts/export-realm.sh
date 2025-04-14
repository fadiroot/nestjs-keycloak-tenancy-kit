#!/bin/bash
set -e

KEYCLOAK_CONTAINER=$(docker-compose ps -q keycloak)
REALM_NAME="softy"  # Replace with your actual realm name

docker exec $KEYCLOAK_CONTAINER /opt/keycloak/bin/kc.sh export --file /opt/keycloak/data/export/${REALM_NAME}-realm.json --realm ${REALM_NAME}

echo "Realm export completed. File saved in keycloak_exports volume."