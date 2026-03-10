# 🌤️ Weather Dashboard — End-to-End DevOps Pipeline

![CI Pipeline](https://github.com/Revanth1486/weather-dashboard-devops/actions/workflows/ci.yml/badge.svg)
![CD Production](https://github.com/Revanth1486/weather-dashboard-devops/actions/workflows/cd-main.yml/badge.svg)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=flat&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=flat&logo=kubernetes&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-FF9900?style=flat&logo=amazonaws&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=flat&logo=terraform&logoColor=white)
![SonarCloud](https://img.shields.io/badge/SonarCloud-F3702A?style=flat&logo=sonarcloud&logoColor=white)

> A production-grade DevOps pipeline showcasing CI/CD, containerization, Infrastructure as Code, Kubernetes orchestration, and real-time monitoring — all deployed on AWS EKS.

---

## 🚀 Live Demo

| Resource | URL |
|----------|-----|
| 🌍 Live App | `http://k8s-staging-weatheri-eff394e0d6-1840808471.us-east-1.elb.amazonaws.com` |
| 🐳 DockerHub | [hub.docker.com/u/revanthdandu983](https://hub.docker.com/u/revanthdandu983) |
| 📊 SonarCloud | [sonarcloud.io/project/overview?id=Revanth1486_weather-dashboard-devops](https://sonarcloud.io/project/overview?id=Revanth1486_weather-dashboard-devops) |

---

## 📸 Screenshots

| CI Pipeline | SonarQube Quality Gate |
|---|---|
| ![CI](.github/screenshots/Screenshot (90).png)) | ![Sonar](.github/screenshots/Screenshot (91).png) |

| Grafana Monitoring | Live App |
|---|---|
| ![Grafana](.github/screenshots/Screenshot (92).png) | ![App](.github/screenshots/Screenshot (93).png) |

---

## 🏗️ Architecture Overview

```
Developer → GitHub Push
                │
                ▼
        ┌─────────────────────────────────────┐
        │         GitHub Actions CI            │
        │  ┌──────┐ ┌────────┐ ┌──────────┐  │
        │  │ Jest │→│Sonarqube│→│  Trivy   │  │
        │  │Tests │ │Quality │ │Security  │  │
        │  └──────┘ └────────┘ └──────────┘  │
        └─────────────────────────────────────┘
                │
                ▼
        ┌─────────────────┐
        │    DockerHub     │
        │  weather-backend │
        │ weather-frontend │
        └─────────────────┘
                │
                ▼
        ┌─────────────────────────────────────┐
        │           AWS EKS Cluster            │
        │                                     │
        │  ┌──────────┐    ┌──────────────┐  │
        │  │ Backend  │    │   Frontend   │  │
        │  │ 2 Pods   │    │   2 Pods     │  │
        │  │ HPA→10   │    │   Nginx      │  │
        │  └──────────┘    └──────────────┘  │
        │         │               │           │
        │         └───────┬───────┘           │
        │                 ▼                   │
        │           AWS ALB Ingress           │
        │        (Internet Facing)            │
        └─────────────────────────────────────┘
                │
                ▼
        ┌─────────────────────────────────────┐
        │      Prometheus + Grafana            │
        │   CPU | Memory | Disk | Uptime       │
        └─────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | Weather UI with city search |
| Backend | Node.js + Express | API proxy for OpenWeatherMap |
| Containerization | Docker (Multi-stage) | Optimized production images |
| CI/CD | GitHub Actions | Automated pipeline (3 workflows) |
| Code Quality | SonarCloud | Quality gate + coverage analysis |
| Security | Trivy | CVE vulnerability scanning |
| Registry | DockerHub | Container image storage |
| Infrastructure | Terraform | IaC — VPC, EKS, IAM, ALB |
| State Backend | AWS S3 + DynamoDB | Remote Terraform state + locking |
| Orchestration | Kubernetes (EKS) | Container orchestration |
| Load Balancer | AWS ALB + Ingress Controller | Traffic routing |
| Auto Scaling | HPA | 2 to 10 pods based on CPU |
| Monitoring | Prometheus | Metrics collection (14 targets) |
| Dashboards | Grafana | CPU, memory, node metrics |
| Testing | Jest + Playwright | 11 unit tests + E2E tests |

---

## 📁 Project Structure

```
weather-dashboard/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI — Test + Sonar + Docker + Trivy
│       ├── cd-develop.yml      # CD Staging — DockerHub + EKS + Playwright
│       └── cd-main.yml         # CD Production — DockerHub + EKS + Monitoring
├── backend/
│   ├── src/
│   │   ├── server.js           # Express server
│   │   └── routes/weather.js   # Weather API route
│   ├── tests/
│   │   └── weather.test.js     # 11 Jest unit tests
│   └── Dockerfile              # Multi-stage backend image
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   └── main.jsx            # Entry point
│   ├── tests/
│   │   └── weather.spec.js     # Playwright E2E tests
│   ├── nginx.conf              # Nginx reverse proxy config
│   └── Dockerfile              # Multi-stage frontend image
├── k8s/
│   ├── deployment.yaml         # Backend + Frontend deployments
│   └── manifests.yaml          # Namespace, Services, Ingress, HPA
├── terraform/
│   ├── main.tf                 # VPC, EKS, Node Group, ALB Controller
│   ├── variables.tf            # Input variables
│   └── outputs.tf              # Output values
├── docker-compose.yml          # Local development
└── sonar-project.properties    # SonarCloud config
```

---

## ⚙️ CI/CD Pipeline

### CI Pipeline (`ci.yml`) — Triggers on every branch push

```
┌─────────────────┐
│  1. Unit Tests  │  Jest — 11 tests, 53.5% coverage
└────────┬────────┘
         │
┌────────▼────────┐
│ 2. SonarCloud   │  Quality Gate: PASSED ✅ | 0% duplication
└────────┬────────┘
         │
┌────────▼────────┐
│ 3. Docker Build │  backend + frontend images
└────────┬────────┘
         │
┌────────▼────────┐
│  4. Trivy Scan  │  CVE scan → SARIF → GitHub Security tab
└─────────────────┘
```

### CD Staging (`cd-develop.yml`) — Triggers on `develop` branch

```
DockerHub Push (develop-{sha}) → EKS Deploy → Playwright E2E Tests
```

### CD Production (`cd-main.yml`) — Triggers on `main` branch

```
DockerHub Push (prod-{build-number}) → EKS Deploy → Prometheus + Grafana Install
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop
- kubectl
- AWS CLI configured
- Terraform 1.5+
- Helm 3+

### Local Development

```bash
# Clone the repo
git clone https://github.com/Revanth1486/weather-dashboard-devops.git
cd weather-dashboard-devops

# Run with Docker Compose
docker-compose up --build

# App running at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

### Run Tests

```bash
cd backend
npm install
npm test              # Run unit tests
npm run test:coverage # Run with coverage report
```

---

## ☁️ Infrastructure (Terraform)

```bash
cd terraform

# Initialize with S3 backend
terraform init

# Preview changes
terraform plan

# Apply (creates 57 AWS resources)
terraform apply

# Destroy when done (saves ~$5-8/day)
terraform destroy
```

### AWS Resources Created

| Resource | Details |
|----------|---------|
| VPC | Custom VPC with 2 public subnets |
| EKS Cluster | weather-dashboard-staging (us-east-1) |
| Node Group | 2× t3.small Spot instances |
| ALB | Internet-facing load balancer |
| IAM Roles | EKS cluster + node group + ALB controller |
| S3 Bucket | weather-dashboard-tfstate-revanth |
| DynamoDB | terraform-state-lock |

---

## ☸️ Kubernetes Deployment

```bash
# Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name weather-dashboard-staging

# Deploy application
kubectl apply -f k8s/

# Check pods
kubectl get pods -n staging

# Check ingress (ALB URL)
kubectl get ingress -n staging

# Check HPA
kubectl get hpa -n staging
```

### Kubernetes Resources

| Resource | Details |
|----------|---------|
| Namespace | staging |
| Deployments | weather-backend (2 replicas), weather-frontend (2 replicas) |
| Services | weather-backend-service (ClusterIP:5000), weather-frontend-service (ClusterIP:80) |
| Ingress | ALB Ingress — routes `/api/*` to backend, `/` to frontend |
| HPA | weather-backend-hpa — scales 2→10 pods at 70% CPU |
| Secrets | weather-api-secret (OPENWEATHER_API_KEY) |

---

## 📊 Monitoring (Prometheus + Grafana)

```bash
# Install monitoring stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=admin123 \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false

# Access Grafana locally
kubectl port-forward -n monitoring svc/monitoring-grafana 4000:80
# Open: http://localhost:4000 (admin / admin123)

# Access Prometheus locally
kubectl port-forward -n monitoring svc/prometheus-operated 9090:9090
# Open: http://localhost:9090
```

### Prometheus Targets (all UP ✅)

- node-exporter (2 nodes)
- kubelet (2 nodes)
- kube-state-metrics
- alertmanager
- coredns
- kube-proxy
- prometheus operator

### Grafana Dashboards

Import these dashboard IDs after setup:

| Dashboard | ID | Shows |
|-----------|-----|-------|
| Node Exporter Full | `12486` | CPU, Memory, Disk per node |
| Kubernetes Cluster | `15661` | Pod status, resource usage |

---

## 🔐 GitHub Secrets Required

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | DockerHub username |
| `DOCKERHUB_TOKEN` | DockerHub access token |
| `SONAR_TOKEN` | SonarCloud token |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `GRAFANA_PASSWORD` | Grafana admin password |

---

## 📈 Project Results

| Metric | Result |
|--------|--------|
| Unit Tests | 11 / 11 PASSING ✅ |
| Code Coverage | 53.5% |
| Quality Gate | PASSED ✅ |
| Code Duplication | 0.0% |
| Docker Images | 2 images pushed to DockerHub |
| Terraform Resources | 57 resources created |
| EKS Nodes | 2 × t3.small Spot instances |
| App Replicas | 2 backend + 2 frontend |
| HPA Max Pods | 10 (auto-scales on CPU) |
| Pipeline Duration | ~3 min CI, ~4 min CD |
| Prometheus Targets | 14 targets all UP |

---

## 🐳 Docker Images

```bash
# Pull images
docker pull revanthdandu983/weather-backend:latest
docker pull revanthdandu983/weather-frontend:latest

# Run locally
docker run -p 5000:5000 -e OPENWEATHER_API_KEY=your_key revanthdandu983/weather-backend:latest
docker run -p 3000:80 revanthdandu983/weather-frontend:latest
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| ALB Ingress no address | Attach `AWSLoadBalancerControllerIAMPolicy` to node group role |
| Pods in CrashLoopBackOff | Check `kubectl logs pod-name -n staging` |
| Terraform state locked | `terraform force-unlock LOCK_ID` |
| Grafana no data | Verify Prometheus URL: `http://prometheus-operated:9090` |
| kubectl not connecting | Re-run `aws eks update-kubeconfig --region us-east-1 --name weather-dashboard-staging` |

---

## 👤 Author

**Dandu Revanth**

- GitHub: [@Revanth1486](https://github.com/Revanth1486)
- DockerHub: [revanthdandu983](https://hub.docker.com/u/revanthdandu983)

---

## ⭐ If this project helped you, give it a star!

> Built with ❤️ as a complete DevOps portfolio project 