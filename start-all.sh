#!/bin/bash

# Check if Elasticsearch container exists
if [ "$(docker ps -aq -f name=elasticsearch)" ]; then
    # Check if the container is running
    if [ "$(docker ps -q -f name=elasticsearch)" ]; then
        echo "Elasticsearch container is already running."
    else
        echo "Starting existing Elasticsearch container..."
        docker start elasticsearch
    fi
else
    echo "Creating and starting new Elasticsearch container..."
    docker run -d --name elasticsearch -p 9200:9200 -e "discovery.type=single-node" elasticsearch:7.17.22
fi

# Wait for Elasticsearch to start
echo "Waiting for Elasticsearch to start..."
until curl -s http://localhost:9200 > /dev/null; do
    sleep 1
done
echo "Elasticsearch is up and running!"

# Start other services
npm run start:frontend &
npm run start:express &
npm run start:express-es &

# Wait for all background processes to finish
wait

# Cleanup: Stop the Elasticsearch container when the script is terminated
trap "docker stop elasticsearch" EXIT