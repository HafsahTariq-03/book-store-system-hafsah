#!/bin/bash

# Book Store MERN Application Kubernetes Deployment Script
# This script deploys the application on minikube

echo "🚀 Starting Book Store Application Deployment on Minikube"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if minikube is running
print_status "Checking minikube status..."
if ! minikube status | grep -q "Running"; then
    print_warning "Minikube is not running. Starting minikube..."
    minikube start --driver=docker --memory=4096 --cpus=2
    if [ $? -ne 0 ]; then
        print_error "Failed to start minikube. Please check your setup."
        exit 1
    fi
else
    print_status "Minikube is already running."
fi

# Enable metrics server for HPA
print_status "Enabling metrics server for HorizontalPodAutoscaler..."
minikube addons enable metrics-server

# Build Docker images using minikube's Docker daemon
print_status "Setting up Docker environment for minikube..."
eval $(minikube docker-env)

# Build backend image
print_status "Building backend Docker image..."
cd ../backend
docker build -t book-store-backend:latest .
if [ $? -ne 0 ]; then
    print_error "Failed to build backend image"
    exit 1
fi

# Build frontend image
print_status "Building frontend Docker image..."
cd ../frontend
docker build -t book-store-frontend:latest .
if [ $? -ne 0 ]; then
    print_error "Failed to build frontend image"
    exit 1
fi

# Return to k8s directory
cd ../k8s

print_status "Images built successfully!"

# Deploy MongoDB with PVC
print_status "Deploying MongoDB with Persistent Volume..."
kubectl apply -f mongodb-pvc.yaml
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f mongodb-service.yaml

# Wait for MongoDB to be ready
print_status "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mongodb-deployment

# Deploy Backend
print_status "Deploying Backend API..."
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# Wait for Backend to be ready
print_status "Waiting for Backend to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/backend-deployment

# Deploy Frontend
print_status "Deploying Frontend..."
kubectl apply -f nginx-configmap.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# Wait for Frontend to be ready
print_status "Waiting for Frontend to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/frontend-deployment

# Deploy HorizontalPodAutoscalers
print_status "Deploying HorizontalPodAutoscalers..."
kubectl apply -f backend-hpa.yaml
kubectl apply -f frontend-hpa.yaml

# Get service URLs
print_status "Getting service URLs..."
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Service Information:"
echo "======================"

# Get LoadBalancer URLs
BACKEND_URL=$(minikube service backend-service --url)
FRONTEND_URL=$(minikube service frontend-service --url)

echo "🔗 Frontend URL: $FRONTEND_URL"
echo "🔗 Backend API URL: $BACKEND_URL"
echo "🔗 MongoDB NodePort: $(minikube ip):30001"

echo ""
echo "📊 Deployment Status:"
echo "===================="
kubectl get deployments
echo ""
echo "🔄 Services:"
echo "============"
kubectl get services
echo ""
echo "📈 HPA Status:"
echo "=============="
kubectl get hpa

echo ""
print_status "To access the application:"
print_status "1. Frontend: Open $FRONTEND_URL in your browser"
print_status "2. Backend API: $BACKEND_URL"
print_status "3. To view pods: kubectl get pods"
print_status "4. To view logs: kubectl logs -f deployment/backend-deployment"
print_status "5. To scale manually: kubectl scale deployment backend-deployment --replicas=5"

echo ""
print_warning "Note: The HPA may take a few minutes to start collecting metrics."
print_warning "Monitor with: kubectl get hpa --watch" 