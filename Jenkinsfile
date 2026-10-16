pipeline {
    agent any

    environment {
        NETWORK = 'webapp-cicd-net'
        BACKEND_IMAGE = 'webapp-cicd-backend:latest'
        FRONTEND_IMAGE = 'webapp-cicd-frontend:latest'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Image') {
            steps {
                sh 'docker build -t "$BACKEND_IMAGE" ./backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                sh 'docker build -t "$FRONTEND_IMAGE" ./frontend'
            }
        }

        stage('Deploy TaskFlow') {
            steps {
                sh '''
                    docker network inspect "$NETWORK" >/dev/null 2>&1 || \
                        docker network create "$NETWORK"

                    docker rm -f webapp-cicd-frontend webapp-cicd-backend 2>/dev/null || true

                    docker run -d \
                        --name webapp-cicd-backend \
                        --network "$NETWORK" \
                        --restart unless-stopped \
                        "$BACKEND_IMAGE"

                    docker run -d \
                        --name webapp-cicd-frontend \
                        --network "$NETWORK" \
                        --restart unless-stopped \
                        -p 127.0.0.1:5175:80 \
                        "$FRONTEND_IMAGE"
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    for i in $(seq 1 15); do
                        if docker exec webapp-cicd-frontend wget -qO- http://localhost/health >/dev/null; then
                            echo "TaskFlow health check passed"
                            docker exec webapp-cicd-frontend wget -qO- http://localhost/api/tasks
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "TaskFlow health check failed"
                    docker logs webapp-cicd-backend
                    docker logs webapp-cicd-frontend
                    exit 1
                '''
            }
        }
    }
}
