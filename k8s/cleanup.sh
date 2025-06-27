#!/bin/bash

# Cleanup script for Book Store Kubernetes deployment

echo "🧹 Cleaning up Book Store Application from Kubernetes..."

# Delete HPA
echo "Deleting HorizontalPodAutoscalers..."
kubectl delete -f frontend-hpa.yaml
kubectl delete -f backend-hpa.yaml

# Delete Services
echo "Deleting Services..."
kubectl delete -f frontend-service.yaml
kubectl delete -f backend-service.yaml
kubectl delete -f mongodb-service.yaml

# Delete ConfigMaps
echo "Deleting ConfigMaps..."
kubectl delete -f nginx-configmap.yaml

# Delete Deployments
echo "Deleting Deployments..."
kubectl delete -f frontend-deployment.yaml
kubectl delete -f backend-deployment.yaml
kubectl delete -f mongodb-deployment.yaml

# Delete PVC
echo "Deleting PersistentVolumeClaim..."
kubectl delete -f mongodb-pvc.yaml

echo "✅ Cleanup completed!"

# Show remaining resources
echo "Remaining resources:"
kubectl get all 