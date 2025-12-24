# Ward-Level Household Data Collection System

A robust, secure, and scalable high-performance backend system built with **Spring Boot** for managing household and family data at the ward level. This system supports strict Role-Based Access Control (RBAC), ward-level data isolation, and real-time analytics.

---

## 🚀 Features

### 🔐 Security & Access Control
- **Role-Based Access Control (RBAC)**: Distinct roles for `SUPER_ADMIN`, `WARD_MEMBER`, and `AGENT`.
- **Ward-Level Isolation**: Users (Agents/Members) are strictly restricted to accessing data within their assigned wards.
- **JWT Authentication**: Secure stateless authentication using JSON Web Tokens.
- **Method-Level Security**: Fine-grained authorization checks using Spring Security `@PreAuthorize` and custom validators.

### 📊 Functional Modules
- **Ward Management**: Create and manage wards (Admin only).
- **User Management**:
  - Admins create Ward Members and Agents.
  - Ward Members can create Agents for their specific wards.
- **Household Data Collection**:
  - Agents can add, view, and update household details (Geolocation, Ration Card info).
  - Manage multiple family members per household.
- **Real-Time Analytics**:
  - Ward Members get a dashboard with population stats, gender distribution, and vulnerable group counts (Seniors, Disabled).
- **Audit Logging**: Comprehensive logging of critical actions (CREATE, UPDATE, VIEW) for accountability.

---

## 🛠️ Tech Stack

- **Language**: Java 17
- **Framework**: Spring Boot 3.x
- **Security**: Spring Security 6, JWT (io.jsonwebtoken)
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA / Hibernate
- **Build Tool**: Maven
- **Utilities**: Lombok, Validation API

---

## 🏗️ Architecture & Entities

### Roles
| Role | Responsibility | Scope |
|------|----------------|-------|
| **SUPER_ADMIN** | System Config, Ward Creation, User Assignment | Global |
| **WARD_MEMBER** | Analytics Dashboard, Agent Creation | Assigned Ward(s) |
| **AGENT** | Data Entry (Households, Family Members) | Assigned Ward(s) |

### Database Schema Overview
- **User**: Stores credentials, roles, and `assignedWards` (Many-to-Many).
- **Ward**: Represents a geographical unit (Panchayat/Municipality).
- **Household**: Core unit, linked to a Ward. Contains address, GPS, ration card data.
- **FamilyMember**: Individuals linked to a Household. Contains demographic and PII data.
- **AuditLog**: Tracks who did what, where, and when.

---

## ⚙️ Installation & Setup

### Prerequisites
- Java Development Kit (JDK) 17+
- Maven 3.6+
- MySQL Server

### 1. Database Configuration
Update the database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ward
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

### 2. Build and Run
Navigate to the backend directory:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 3. Automatic Data Seeding
On the first run, the system will automatically seed default users and sample data via `DataSeeder.java`.

---

## 🔑 Default Credentials

Use these credentials to test the system initially:

| Role | Email | Password | Assigned Scope |
|------|-------|----------|----------------|
| **Super Admin** | `super@admin.com` | `Admin@123` | Global |


---

## 📡 API Endpoints

### 🟢 Authentication
- `POST /auth/authenticate`: Login to receive JWT Token.

### 🛡️ Super Admin APIs
- `GET /api/wards`: List all wards.
- `POST /api/wards`: Create a new ward.
- `POST /api/users`: Create generic users (Admin/Members).

### 📋 Ward Member APIs
- `GET /api/wards/{wardId}/dashboard`: Get analytics (Population, Gender, Welfare stats).
- `GET /api/wards/{wardId}/households`: Read-only view of households.
- `POST /api/wards/{wardId}/agents`: Create an Agent for the assigned ward.

### 📝 Agent APIs
- **Setup**
  - `GET /api/my-wards`: View assigned wards.
- **Household Management**
  - `POST /api/wards/{wardId}/households`: Create a new household.
  - `GET /api/households/{id}`: Get household details.
  - `PUT /api/households/{id}`: Update household details.
- **Family Management**
  - `GET /api/households/{id}/members`: List family members.
  - `POST /api/households/{id}/members`: Add a family member.
  - `PUT /api/family-members/{id}`: Update family member details.

---

## 🧪 Testing with Postman

1. **Login**: Send a `POST` request to `/auth/authenticate` with the default JSON body:
   ```json
   {
     "email": "agent@example.com",
     "password": "agent123"
   }
   ```
2. **Copy Token**: Copy the `token` from the response.
3. **Authorize**: In Postman, go to the **Authorization** tab, select **Bearer Token**, and paste the token.
4. **Make Requests**: Now you can access protected endpoints like `/api/my-wards` or `/api/wards/1/households`.

---

## 🔒 Security Implementation Details

The system uses a custom `WardAccessValidator` bean to enforce isolation.
Example of a protected endpoint:
```java
@PreAuthorize("@wardSecurity.canManageWard(#wardId)") 
public ResponseEntity<User> createAgent(...)
```
This ensures that even if a Ward Member tries to create an agent for a ward they don't own, the system rejects the request at the security filter layer.

---
**Developed for Ward Data Collection Project**


 by analysing the backend fully make a proffesional responsive  frontend for the application the style have to be very good and also light green theme 