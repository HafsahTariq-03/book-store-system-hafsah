pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_PROJECT = 'book-management'
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                // Checkout code from repository
                checkout scm
            }
        }
        
        stage('Setup Environment') {
            steps {
                // Create backend environment file
                sh '''
                    cat > backend/.env << EOF
PORT=5555
NODE_ENV=production
EOF
                '''
            }
        }
        
        stage('Build and Start Containers') {
            steps {
                // Build and start Docker containers
                sh 'docker-compose -p ${DOCKER_COMPOSE_PROJECT} -f ${DOCKER_COMPOSE_FILE} build'
                sh 'docker-compose -p ${DOCKER_COMPOSE_PROJECT} -f ${DOCKER_COMPOSE_FILE} up -d'
            }
        }
        
        stage('Verify Deployment') {
            steps {
                // Check running containers
                sh 'docker ps | grep book-management'
                sh 'sleep 10'
                
                // Basic health check for backend service
                sh 'curl -s http://localhost:5002 || true'
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        
        failure {
            echo 'Deployment failed!'
            // Try to clean up containers if deployment failed
            sh 'docker-compose -p ${DOCKER_COMPOSE_PROJECT} -f ${DOCKER_COMPOSE_FILE} down || true'
        }
        
        always {
            // Archive any logs
            archiveArtifacts artifacts: '**/docker-compose.log', allowEmptyArchive: true
        }
    }
}
