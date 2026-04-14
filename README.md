<div align="center">

<br/>

<img src="https://img.shields.io/badge/LifeGuide-Your%20Personal%20Hub-6366f1?style=for-the-badge&logo=sparkles&logoColor=white" alt="LifeGuide" height="40"/>

<br/><br/>

**A self-hosted, full-stack personal productivity suite.**  
Track habits, manage tasks, plan workouts, share shopping lists, and more — all in one sleek, dark-themed app built for your homeserver.

<br/>

[![Deploy](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)](https://github.com/Johnny0711/LifeGuide/actions)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](./docker-compose.yml)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0-6DB33F?style=flat-square&logo=springboot&logoColor=white)](./api)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](./frontend)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](./database)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](./frontend)

<br/>

</div>

---

## ✨ Features

| Module | Description |
|---|---|
| 📋 **Tasks** | Create, complete, and manage your to-do items |
| 🔥 **Habits** | Track daily habits with streak counters and completion history |
| 💪 **Fitness Tracker** | Build workout routines, log exercises with sets/reps/weight, drag & drop to reorder, and track body weight over time with a live graph |
| 📌 **Pins** | Save notes, links, and ideas as color-coded pin cards |
| 🛒 **Shopping Lists** | Create shared lists, invite other users, and check off items in real time |
| ✉️ **Inbox** | Internal messaging system for user-to-user communication |
| 🧑‍💼 **Admin Dashboard** | Manage users, roles, and account setup from a dedicated admin panel |
| 🏠 **Dashboard** | Personalized hub with daily insights — habit score, streak, and pending tasks at a glance |

---

## 🛠 Tech Stack

### Backend — `api/`
| Technology | Version | Role |
|---|---|---|
| **Spring Boot** | 4.0 | REST API framework |
| **Spring Security + JWT** | — | Stateless authentication |
| **Spring Data JPA** | — | ORM & database access |
| **PostgreSQL** | 15 | Primary database |
| **Java** | 21 | Runtime |
| **Gradle** | — | Build tool |

### Frontend — `frontend/`
| Technology | Version | Role |
|---|---|---|
| **React** | 19 | UI framework |
| **TypeScript** | 5.9 | Type-safe JavaScript |
| **Vite** | 5 | Build tool & dev server |
| **React Router** | 7 | Client-side routing |
| **Recharts** | 3 | Weight trend charts |
| **Lucide React** | — | Icon library |
| **Axios** | — | HTTP client |
| **Vanilla CSS** | — | Glassmorphism design system |

### Infrastructure
| Technology | Role |
|---|---|
| **Docker + Docker Compose** | Containerisation of all three services |
| **Nginx** | Serves the frontend and proxies API requests |
| **GitHub Actions** | CI/CD — auto-deploy to homeserver on push to `main` |

---

## 🏗️ Architecture

Our services are isolated within a dedicated Docker network (`homeserver-net`) to ensure secure, internal-only communication between the backend and database.

```mermaid
flowchart LR
    subgraph Network [Docker Network: homeserver-net]
        direction LR
        
        Frontend[fa:fa-server <b>lifeguide_frontend</b><br/>Nginx :80]
        API[fa:fa-cogs <b>lifeguide_api</b><br/>Spring Boot :8080]
        DB[(fa:fa-database <b>lifeguide_db</b><br/>PostgreSQL :5432)]

        Frontend ===>|HTTP| API
        API ===>|JDBC| DB
    end

    style Frontend fill:#009639,stroke:#005c23,stroke-width:2px,color:#fff
    style API fill:#6db33f,stroke:#4a7a2b,stroke-width:2px,color:#fff
    style DB fill:#336791,stroke:#234764,stroke-width:2px,color:#fff
```

### Component Breakdown

* **`homeserver-net`**: The isolated private network encapsulating the services.
* **`lifeguide_frontend`**: The web server running **Nginx** on port `80`. It serves static assets and acts as a reverse proxy, forwarding requests to the backend API.
* **`lifeguide_api`**: The backend application running **Spring Boot** on port `8080`. It handles the core business logic.
* **`lifeguide_db`**: The database running **PostgreSQL** on port `5432`. It persists application data and communicates securely with the API via JDBC.

## 📄 License

This project is personal / homelab software. Feel free to fork and adapt it for your own setup.

