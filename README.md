# 🌤️ Weather Dashboard — Full DevOps Pipeline

![CI Pipeline](https://github.com/YOUR_USERNAME/weather-dashboard-devops/actions/workflows/ci.yml/badge.svg)
![CD Staging](https://github.com/YOUR_USERNAME/weather-dashboard-devops/actions/workflows/cd-develop.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=weather-dashboard&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=weather-dashboard)

> A real-time weather dashboard with a production-grade end-to-end DevOps pipeline — built to demonstrate CI/CD, containerization, IaC, and Kubernetes orchestration.

**🌍 Live Demo:** [https://weather.yourname.dev](https://weather.yourname.dev)

---

## 🏗️ Architecture

```
Developer Push → GitHub Actions CI → SonarQube → Trivy Scan
                                                      ↓
                                              JFrog Artifactory
                                                      ↓
                                         Terraform (VPC + EKS)
                                                      ↓
                                        Kubernetes Deployment
                                                      ↓
                                         Playwright QA Tests
                                                      ↓
                                         Production (main)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, nginx |
| **Backend** | Node.js, Express, Helmet |
| **CI/CD** | GitHub Actions |
| **Code Quality** | SonarCloud |
| **Security Scan** | Trivy (CVE scanning) |
| **Container Registry** | JFrog Artifactory |
| **Infrastructure** | Terraform (IaC) |
| **Orchestration** | Kubernetes on AWS EKS |
| **QA Testing** | Playwright E2E |
| **API** | OpenWeatherMap |

---

## 📁 Project Structure

```
weather-dashboard-devops/
├── backend/               # Node.js Express API
│   ├── src/
│   │   ├── routes/weather.js
│   │   └── server.js
│   ├── tests/             # Jest unit tests
│   ├── Dockerfile
│   └── package.json
├── frontend/              # React Vite app
│   ├── src/App.jsx
│   ├── tests/             # Playwright E2E tests
│   ├── Dockerfile
│   └── nginx.conf
├── .github/workflows/
│   ├── ci.yml             # Build + Test + Scan
│   ├── cd-develop.yml     # Staging deploy
│   └── cd-main.yml        # Production deploy
├── terraform/             # EKS + VPC infrastructure
├── k8s/                   # Kubernetes manifests
├── docker-compose.yml     # Local development
└── sonar-project.properties
```

---

## 🚀 Pipeline Stages

### CI (Every Push)
1. **Unit Tests** — Jest with 70%+ coverage gate
2. **SonarQube** — Code quality & coverage analysis
3. **Docker Build** — Multi-stage builds (backend + frontend)
4. **Trivy Scan** — CVE vulnerability scanning on images

### CD - Staging (develop branch)
5. **JFrog Push** — Image tagged `develop-{git-sha}`
6. **EKS Deploy** — Rolling update, zero downtime
7. **Playwright QA** — 10 automated E2E tests

### CD - Production (main branch)
8. **Production Image** — Tagged `{git-sha}` + `latest` + `prod-{build-number}`
9. **Manual Approval** — GitHub Environments gate
10. **Production Deploy** — Zero-downtime rolling update to prod EKS

---

## ⚡ Quick Start (Local)

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/weather-dashboard-devops
cd weather-dashboard-devops

# 2. Set your API key
echo "OPENWEATHER_API_KEY=your_key_here" > .env

# 3. Run everything locally
docker-compose up --build

# 4. Open browser
open http://localhost:3000
```

---

## 🔧 Infrastructure Setup

```bash
# 1. Initialize Terraform (first time - create S3 bucket manually first)
cd terraform
terraform init

# 2. Plan infrastructure
terraform plan -var="environment=staging"

# 3. Apply (creates VPC + EKS ~10 mins)
terraform apply -var="environment=staging"

# 4. Configure kubectl
aws eks update-kubeconfig --region us-east-1 --name weather-dashboard-staging

# 5. Deploy app
kubectl apply -f ../k8s/

# ⚠️ IMPORTANT: Destroy when not using to avoid costs
terraform destroy
```

---

## 🔐 GitHub Secrets Required

```
OPENWEATHER_API_KEY      → openweathermap.org (free)
SONAR_TOKEN              → sonarcloud.io (free)
JFROG_REGISTRY           → your.jfrog.io
JFROG_USERNAME           → JFrog username
JFROG_PASSWORD           → JFrog API key
AWS_ACCESS_KEY_ID        → IAM user
AWS_SECRET_ACCESS_KEY    → IAM user secret
```

---

## 🧪 Running Tests

```bash
# Backend unit tests
cd backend && npm test

# Frontend E2E tests (needs running app)
cd frontend && npx playwright test

# View coverage report
open backend/coverage/lcov-report/index.html
```

---

## 💰 AWS Cost Management

| Resource | Cost | Action |
|---|---|---|
| EKS Control Plane | ~$0.10/hr | `terraform destroy` after use |
| t3.small × 2 (Spot) | ~$0.01/hr | Auto-terminated with destroy |
| ALB | ~$0.02/hr | Removed with destroy |

**Total for a 2-hour demo:** ~$0.25

---

## 📸 Pipeline Screenshots

> Add screenshots of your GitHub Actions runs here

---

## 👤 Author

Built by **[Your Name]** as a DevOps portfolio project demonstrating end-to-end CI/CD with GitHub Actions, Docker, SonarQube, Trivy, JFrog, Terraform, and AWS EKS.

Connect: [LinkedIn](https://linkedin.com) | [GitHub](https://github.com)
