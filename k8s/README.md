# Book Store MERN Application - Kubernetes Deployment

This directory contains Kubernetes YAML files and deployment scripts for deploying the Book Store MERN (MongoDB, Express, React, Node.js) application on a minikube cluster.

## Prerequisites

Before deploying, ensure you have the following installed on your Ubuntu VM:

1. **Docker**: For building container images and as minikube driver
2. **Minikube**: Lightweight Kubernetes implementation
3. **kubectl**: Kubernetes command-line tool

### Installation Commands (Ubuntu)

```bash
# Install Docker
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Note: VirtualBox not needed when using docker driver

# Install minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Reboot or logout/login to apply docker group changes
```

## Architecture Overview

The application consists of:

- **Frontend**: React application served by Nginx (2 replicas, LoadBalancer service)
- **Backend**: Node.js/Express API server (3 replicas, LoadBalancer service) 
- **Database**: MongoDB with persistent storage (1 replica, NodePort service)
- **Auto-scaling**: HorizontalPodAutoscaler for both frontend and backend

## Kubernetes Resources

### 1. Database Layer (MongoDB)
- `mongodb-pvc.yaml`: PersistentVolumeClaim for data persistence (5Gi)
- `mongodb-deployment.yaml`: MongoDB deployment with persistent volume
- `mongodb-service.yaml`: NodePort service for internal database access

### 2. Backend Layer (Node.js/Express)
- `backend-deployment.yaml`: Backend API deployment with 3 replicas
- `backend-service.yaml`: LoadBalancer service for external API access
- `backend-hpa.yaml`: HorizontalPodAutoscaler (2-10 replicas, 70% CPU threshold)

### 3. Frontend Layer (React/Nginx)
- `nginx-configmap.yaml`: Nginx configuration for API proxy
- `frontend-deployment.yaml`: Frontend deployment with 2 replicas
- `frontend-service.yaml`: LoadBalancer service for web access
- `frontend-hpa.yaml`: HorizontalPodAutoscaler (1-5 replicas, 70% CPU threshold)

## Quick Deployment

### Option 1: Automated Deployment (Recommended)

```bash
# Navigate to the k8s directory
cd k8s

# Run the deployment script
./deploy.sh
```

### Option 2: Manual Step-by-Step Deployment

```bash
# 1. Start minikube
minikube start --driver=docker --memory=4096 --cpus=2

# 2. Enable metrics server for HPA
minikube addons enable metrics-server

# 3. Set Docker environment to minikube
eval $(minikube docker-env)

# 4. Build images
cd ../backend
docker build -t book-store-backend:latest .

cd ../frontend  
docker build -t book-store-frontend:latest .

cd ../k8s

# 5. Deploy MongoDB
kubectl apply -f mongodb-pvc.yaml
kubectl apply -f mongodb-deployment.yaml
kubectl apply -f mongodb-service.yaml

# 6. Wait for MongoDB
kubectl wait --for=condition=available --timeout=300s deployment/mongodb-deployment

# 7. Deploy Backend
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml

# 8. Deploy Frontend
kubectl apply -f nginx-configmap.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml

# 9. Deploy HPA
kubectl apply -f backend-hpa.yaml
kubectl apply -f frontend-hpa.yaml

# 10. Get service URLs
minikube service frontend-service --url
minikube service backend-service --url
```

## Accessing the Application

After deployment, get the service URLs:

```bash
# Frontend URL
minikube service frontend-service --url

# Backend API URL  
minikube service backend-service --url

# MongoDB connection (from inside cluster)
# Host: mongodb-service:27017
# External access: $(minikube ip):30001
```

## Monitoring and Management

### View Resources
```bash
# View all pods
kubectl get pods

# View deployments
kubectl get deployments

# View services
kubectl get services

# View HPA status
kubectl get hpa

# View persistent volumes
kubectl get pv,pvc
```

### View Logs
```bash
# Backend logs
kubectl logs -f deployment/backend-deployment

# Frontend logs
kubectl logs -f deployment/frontend-deployment

# MongoDB logs
kubectl logs -f deployment/mongodb-deployment
```

### Scaling
```bash
# Manual scaling
kubectl scale deployment backend-deployment --replicas=5
kubectl scale deployment frontend-deployment --replicas=3

# View HPA scaling
kubectl get hpa --watch
```

## Cleanup

To remove all deployed resources:

```bash
./cleanup.sh
```

Or manually:

```bash
kubectl delete -f frontend-hpa.yaml
kubectl delete -f backend-hpa.yaml
kubectl delete -f frontend-service.yaml
kubectl delete -f backend-service.yaml
kubectl delete -f mongodb-service.yaml
kubectl delete -f nginx-configmap.yaml
kubectl delete -f frontend-deployment.yaml
kubectl delete -f backend-deployment.yaml
kubectl delete -f mongodb-deployment.yaml
kubectl delete -f mongodb-pvc.yaml
```

## Troubleshooting

### Common Issues

1. **Images not found**: Ensure you've run `eval $(minikube docker-env)` before building images
2. **MongoDB connection failed**: Check if MongoDB pod is running and service is accessible
3. **HPA not working**: Ensure metrics-server addon is enabled: `minikube addons enable metrics-server`
4. **Services not accessible**: Use `minikube service <service-name> --url` to get correct URLs

### Useful Commands

```bash
# Check minikube status
minikube status

# SSH into minikube
minikube ssh

# View minikube dashboard
minikube dashboard

# Check cluster info
kubectl cluster-info

# Describe problematic pods
kubectl describe pod <pod-name>

# Port forward for direct access
kubectl port-forward svc/backend-service 8080:5555
kubectl port-forward svc/frontend-service 3000:80
```

## Environment Variables

The deployment uses the following environment variables:

### Backend
- `PORT`: 5555
- `MONGODB_URI`: mongodb://admin:password123@mongodb-service:27017/bookstore?authSource=admin
- `JWT_SECRET`: your-secret-key-here

### MongoDB
- `MONGO_INITDB_ROOT_USERNAME`: admin
- `MONGO_INITDB_ROOT_PASSWORD`: password123

**Note**: In production, use Kubernetes Secrets for sensitive data instead of plain text in YAML files.

## Resource Requirements

- **Minimum**: 4GB RAM, 2 CPUs for minikube
- **Recommended**: 8GB RAM, 4 CPUs for better performance
- **Storage**: 10GB for Docker containers + application data

## Next Steps

1. **Security**: Implement proper secrets management
2. **Monitoring**: Add monitoring with Prometheus/Grafana
3. **Ingress**: Replace LoadBalancer services with Ingress controller
4. **CI/CD**: Integrate with Jenkins or GitHub Actions
5. **Production**: Migrate to managed Kubernetes service (EKS, GKE, AKS) 