# Predictive Maintenance System

## Overview

Predictive Maintenance System is an intelligent industrial monitoring solution developed during the SRUJAN Hackathon – NAVONMESH 2026 at Shri Sant Gajanan Maharaj College of Engineering.

The system is designed to predict potential machine failures before they occur by analyzing operational parameters such as temperature, pressure, vibration, and machine performance metrics. By combining machine learning techniques with real-time data processing, the application helps industries minimize downtime, improve maintenance planning, and reduce operational costs.

The project demonstrates the integration of machine learning, backend APIs, and modern web technologies into a unified solution capable of providing actionable maintenance insights.

---

## Problem Statement

Industrial equipment failures often result in production delays, increased maintenance expenses, and significant financial losses. Traditional maintenance strategies either react to failures after they occur or perform maintenance at fixed intervals regardless of machine condition.

This project addresses the problem by implementing a predictive maintenance approach that analyzes machine data and identifies failure patterns in advance, enabling organizations to take preventive actions before breakdowns occur.

---

## Key Features

The system provides machine failure prediction using a trained machine learning model and processes machine health parameters through a backend API. It offers an interactive dashboard that allows users to monitor machine conditions and view prediction results in a simple and intuitive interface.

The architecture supports seamless communication between the frontend application, backend services, and machine learning components. The solution is designed with scalability in mind and can be extended for real-world industrial environments and IoT-based monitoring systems.

---

## System Architecture

The application follows a modular architecture consisting of data processing, machine learning prediction, backend services, and frontend visualization.

Machine operational data is collected and processed before being passed to the machine learning model. The prediction results are then served through FastAPI endpoints and displayed on the web dashboard for users to review and analyze.

---

## Technology Stack

### Frontend

* React
* Vite
* HTML5
* CSS3
* JavaScript

### Backend

* Python
* FastAPI
* REST APIs

### Machine Learning

* Scikit-learn
* Pandas
* NumPy
* Joblib

---

## Deployment

The application has been deployed using modern cloud platforms.

### Frontend

Hosted on Vercel

### Backend

Hosted on Render

### API Documentation

https://predictive-maintenance-backend-swom.onrender.com/docs

---

## Local Setup

Clone the repository:

```bash
git clone https://github.com/MoinFarooqui/Shegaon-Hackathon---Predictive-Maintenance-Industries.git
cd Shegaon-Hackathon---Predictive-Maintenance-Industries
```

Install backend dependencies:

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

Install frontend dependencies:

```bash
cd frontend
npm install
npm run dev
```

---

## Future Enhancements

Future improvements include integration with IoT sensors, cloud-based monitoring infrastructure, advanced predictive models, real-time alert mechanisms, and enhanced analytics dashboards for large-scale industrial deployments.

---

## Contributors

### Moin Farooqui

Machine Learning, Backend Development, API Integration, System Deployment, and Project Integration.

### Maaz Ahmad Khan

Frontend Development, User Interface Design, Dashboard Implementation, and Frontend Integration.

---

## Hackathon Information

This project was developed as part of the SRUJAN Hackathon – NAVONMESH 2026 organized by Shri Sant Gajanan Maharaj College of Engineering under the domain of Artificial Intelligence and Industrial Automation.

---

## License

This project is intended for educational, research, and demonstration purposes.

---

## Project Status

Frontend Deployment Completed

Backend Deployment Completed

Machine Learning Integration Completed

End-to-End System Integration Completed
