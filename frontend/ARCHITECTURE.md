# FleetFlow – Complete System Architecture Blueprint

This document outlines the production-ready base architecture for **FleetFlow**, a modular fleet & logistics management system. 

---

## 🏗️ 1. System Architecture Overview
*   **Frontend**: Next.js (React) utilizing a modular component design (Tailwind CSS for UI).
*   **Backend**: Django service-oriented architecture and db connection (Views, Services, Repositories) Prisma also can be used.
*   **Database**: PostgreSQL for robust relational data integrity, interfaced via Django ORM for type safety.
*   **State Management System**: React Context API / Redis for global client state (user session, active filters). SWR/React Query for server-state caching and seamless frontend synchronization.
*   **Event-Driven Updates**: Server-Sent Events (SSE) or WebSockets for real-time dashboard updates (e.g., active fleet count, urgent alerts).
*   **Availability Pool Logic**: Dynamic, indexed DB queries strictly checking against `status = 'Available'` combined with temporal checks to ensure zero-conflict asset assignments.
*   **Validation Layer**: Zod schemas for end-to-end type safety, validating incoming API requests *before* controller processing.
*   **Service Layer Structure**: Pure business logic encapsulating trip dispatching, automated maintenance triggers, and complex KPI calculations.
*   **Repository Pattern**: Abstracts direct DB calls out of the services, allowing for robust unit testing and future DB switching.

---

## 👥 2. User Roles & RBAC Matrix
The system implements a strict Role-Based Access Control (RBAC) matrix enforced via middleware.

| Role | View Permissions | Edit Permissions | Restricted Pages | System Blocks |
| :--- | :--- | :--- | :--- | :--- |
| **Fleet Manager** | All pages, All Reports | Vehicles, Users, Trips | None | Cannot delete active vehicles/trips |
| **Dispatcher** | Command Center, Vehicles, Trips, Drivers | Create/Edit Trips, Assign Drivers/Vehicles | Financial Reports, Users Admin, Security | Cannot assign 'In Shop' vehicles |
| **Safety Officer** | Drivers, Maintenance, Trips | Driver Status, Maintenance Logs | Financial Reports, Dispatch | Cannot assign drivers to trips |
| **Financial Analyst** | Financial Reports, Expenses, Trips (View only) | Expense Logs | Dispatch, Maintenance (Edit) | Read-only access to operational data |

---

## 🖥️ 3. Core System Pages Breakdown

### 1️⃣ Login & Authentication
*   **UI Structure**: Centered sleek login card, Email/Password inputs, "Forgot Password" flow.
*   **Auth Flow**: Form Submit -> Payload validation -> DB Hash verification -> Generate JWT -> Set `HttpOnly` secure cookie -> Role-based redirect.
*   **Middleware Logic**: `_middleware.ts` intercepts protected routes, verifies JWT integrity, and checks the RBAC matrix. Unauthorized accesses redirect to `/unauthorized`.
*   **Security Rules**: 
    *   *Account Lock*: After 5 consecutive failed attempts, sets `lockUntil` timestamp in DB for 15 minutes.
    *   *Password Expiry*: Enforces re-creation if `lastPasswordChange` exceeds 90 days.

### 2️⃣ Command Center (Main Dashboard)
*   **Purpose**: High-level Fleet oversight.
*   **UI Structure**: Top row KPI metric cards, middle map visualization/active trips list, bottom critical alerts panel. Sidebar with filters (Region, Vehicle type, Status).
*   **Backend Queries**: Fast aggregate queries optimized with indices. e.g., `SELECT count(*) FROM Vehicles WHERE status = 'On Trip'`.
*   **Real-time Update Logic**: Dispatch endpoints emit events to an SSE stream that the dashboard subscribes to, instantly reflecting state changes.
*   **KPI Formulas**:
    *   *Utilization Rate* = `(Vehicles 'On Trip' / Total Active Vehicles) * 100`
    *   *Maintenance Alerts* = `Count(Vehicles 'In Shop')`

### 3️⃣ Vehicle Registry (Asset Management)
*   **UI Structure**: Granular data tables utilizing status pills (Green: Available, Blue: On Trip, Red: In Shop, Gray: Retired).
*   **Logic**:
    *   *Deletion Block*: Pre-hook validations query the `Trips` table; structurally prevents deletion (utilizing soft-delete instead) if references exist.
    *   *Retirement*: Changing status to `Retired` immediately excludes the asset from all standard dispatcher pools.
    *   *Service Automation*: Logging a service order programmatically updates asset to `In Shop`.

### 4️⃣ Trip Dispatcher & Management
*   **Trip Lifecycle**: `Draft → Dispatched → Completed → Cancelled`
*   **UI Structure**: Multi-step wizard layout. 1. Cargo Details (Weight, Location), 2. Select Vehicle (Filtered precisely by capacity/status), 3. Select Driver.
*   **State Machine Transitions**: 
    *   On Dispatched: Trip (`Dispatched`), Vehicle (`On Trip`), Driver (`On Trip`).
    *   On Completed: Trip (`Completed`), Vehicle (`Available`), Driver (`Available`).

### 5️⃣ Maintenance & Service Logs
*   **UI Structure**: Modal/Side-drawer form to Add Record (Type, Cost, Odometer). Drill-down list view of historical logs per vehicle.
*   **Logic**:
    *   *Adding Maintenance*: Instantiates a service log transaction, auto-switches vehicle to `In Shop`, hiding it from dispatcher queries immediately.
    *   *Closing Service*: Updates log to resolved, switches vehicle back to `Available`. Accumulates cost into the aggregate financial rollup.

### 6️⃣ Completed Trip, Expense & Fuel Logging
*   **Automated Calculation Logic**: `Total Operational Cost per Vehicle = SUM(Fuel) + SUM(Maintenance)`.
*   **Cost-per-km Logic**: `(Total Operational Cost over Period) / (End Odometer - Start Odometer)`.
*   **Aggregation**: Financial rollups utilizing scheduled background cron jobs to prevent runtime blocking.

### 7️⃣ Driver Performance & Safety Profiles
*   **UI Structure**: Detailed user profile pages detailing history, license data, and performance metrics.
*   **Rules**: 
    *   A daily cron job evaluating `licenseExpiry`. Expired licenses trigger an auto-update converting driver status to `Suspended`, explicitly blocking dispatch assignment.
*   **Safety Score Formula**: `Base(100) - (Speeding Events * 5) - (Hard Brakes * 2) - (Late Deliveries * 1)`.

### 8️⃣ Operational Analytics & Financial Reports
*   **Logic**:
    *   *Vehicle ROI* = `[SUM(Trip.revenue) - SUM(Vehicle.maintenance + Vehicle.fuel)] / Vehicle.acquisitionCost`
*   **Export Logic**:
    *   *CSV*: Node.js `csv-stringify` streams pulling via cursor pagination from Postgres to prevent memory heap exhaustion.
    *   *PDF*: Serverless Puppeteer rendering HTML layouts tailored for A4 print.

---

## 🔁 4. Workflow Logic Summary & State Transitions
Using system-driven automation logic, the lifecycle guarantees data parity.

**State Transition Diagram:**
```text
[VEHICLE]
(Creation) -> Available <--> On Trip -> Available
Available <--> In Shop -> Available
Available/In Shop/On Trip -> Retired -> (End)

[TRIP]
(Creation) -> Draft -> Dispatched -> Completed/Cancelled -> (End)

[DRIVER]
(Creation) -> Off Duty <--> On Duty <--> On Trip -> On Duty
On Duty/Off Duty -> Suspended -> On Duty
```

**Lifecycle Automation Workflow:**
1.  **Vehicle Intake**: Asset enrolled → System defines as `Available`.
2.  **Compliance Check**: Driver clocks in → System maps License Expiry → Evaluates as `On Duty` or strictly blocks.
3.  **Dispatch Validation**: Dispatcher initializes → Rule Engine verifies `Payload.Cargo <= Asset.Capacity`, `Asset.Status == Available`, `Driver.Status == On Duty`.
4.  **Status Auto Updates**: Transaction commits → Trip is `Dispatched` → Asset & Driver auto-mutated to `On Trip`.
5.  **Analytics Trigger**: Trip shifts to `Completed` → Async queue job spawned to recalculate company KPI caches.

---

## 🗄️ 5. Database Design
Relational schema leveraging precise normalization and foreign-key constraints.

**Tables & Schema Definitions:**
*   **Users**: `id (PK)`, `name`, `email (UNIQUE/IDX)`, `passwordHash`, `role_id (FK)`, `status`
*   **Roles**: `id (PK)`, `name (VARCHAR)`, `permissions (JSONB)`
*   **Vehicles**: `id (PK)`, `model`, `licensePlate (UNIQUE/IDX)`, `maxLoadCapacity (INT)`, `odometer (INT)`, `acquisitionCost (DECIMAL)`, `status (ENUM: Available, On Trip, In Shop, Retired)`
*   **Drivers**: `id (PK)`, `user_id (UNIQUE FK)`, `licenseCategory`, `licenseExpiry (DATE)`, `status (ENUM)`, `safetyScore (INT)`
*   **Trips**: `id (PK)`, `vehicle_id (FK/IDX)`, `driver_id (FK/IDX)`, `cargoWeight (INT)`, `pickupLocation`, `dropLocation`, `status (ENUM)`, `startDate`, `endDate`, `revenue (DECIMAL)`
*   **MaintenanceLogs**: `id (PK)`, `vehicle_id (FK/IDX)`, `type`, `cost (DECIMAL)`, `serviceDate`, `odometerAtService (INT)`
*   **FuelLogs**: `id (PK)`, `vehicle_id (FK/IDX)`, `trip_id (FK Nullable)`, `liters (DECIMAL)`, `cost (DECIMAL)`, `logDate`
*   **Expenses**: `id (PK)`, `description`, `amount (DECIMAL)`, `loggedDate`
*   **Regions**: `id (PK)`, `name`, `boundaries (PostGIS Polygon / JSONB)`

---

## ⚙️ 6. API Endpoints
Following RESTful conventions grouped by domain.

*   **Auth**:
    *   `POST /api/auth/login`
    *   `POST /api/auth/logout`
*   **Dashboard**:
    *   `GET /api/dashboard/kpis` *(SSE enabled endpoint)*
*   **Vehicles**:
    *   `GET /api/vehicles` *(Supports ?status=Available&minCapacity=...)*
    *   `POST /api/vehicles`
    *   `PUT /api/vehicles/:id`
*   **Trips & Dispatch**:
    *   `POST /api/trips/dispatch` *(Transactional heavily validated)*
    *   `PUT /api/trips/:id/status` *(Powers lifecycle progression)*
*   **Maintenance**:
    *   `POST /api/maintenance`
    *   `GET /api/maintenance/vehicle/:id`
*   **Reports**:
    *   `GET /api/reports/financials?format=[json|csv|pdf]`

---

## 🛡️ 7. Business Logic & Validation Pseudocode

**Business Rule Engine Logic:**
Evaluated natively in the service layer before any database mutation.
```javascript
function validateTripDispatch(vehicle, driver, tripPayload) {
  if (vehicle.status !== 'Available') {
    throw new ValidationError("Vehicle is currently engaged or out of service.");
  }
  if (driver.status !== 'On Duty') {
    throw new ValidationError("Driver is not available for active duty.");
  }
  if (driver.licenseExpiry < Date.now()) {
    throw new SecurityError("Driver license expired. Dispatch blocked.");
  }
  if (tripPayload.cargoWeight > vehicle.maxLoadCapacity) {
    throw new ValidationError("Cargo weight exceeds vehicle's maximum registered capacity.");
  }
  return true;
}
```

---

## 🔐 8. Security Requirements
*   **Action Logging (Audit Trails)**: Utilizing database trigger functions or backend middleware to record every `PUT/POST/PATCH` into an `AuditLogs` table tracking `user_id`, `action`, `old_value`, and `new_value`.
*   **Soft Deletion vs Hard Deletion**: `Vehicles`, `Trips`, and `Users` utilize an `isDeleted` or `deletedAt` flag instead of destructive SQL drops. Maintains historical graph integrity for ROI analytics.
*   **Transaction Handling**: Creating a trip initiates a unified DB Transaction block (`BEGIN ... COMMIT`). Writing the `Trip`, mutating the `Vehicle` status, and mutating the `Driver` status are atomized. If *any* part errors, the entire procedure acts under `ROLLBACK`.

---

## 🚨 9. Edge Cases & Mitigation
1.  **Driver license expires mid-trip**: The daily system cron evaluates expires. Flags the driver as `Suspended` internally, but *conditionally* permits the active `Trip` to reach the `Completed` state for operational continuity. Future dispatches are immediately blocked.
2.  **Vehicle under maintenance assigned accidentally**: Prevented mechanically by enforcing strict `WHERE status = 'Available'` dropdowns on the frontend, combined with a secondary hard transaction block API side (refer to validation logic).
3.  **Fuel log without an active trip**: Modeled systemically by making `trip_id` Nullable on `FuelLogs`. Routine refuels during downtime attribute cost cleanly strictly to the `Vehicle`.
4.  **Negative cost entries**: Thwarted by Zod payload schemas (`z.number().positive()`) stripping the injection before processing.
5.  **Duplicate license plate**: DB-level `UNIQUE` constraint guarantees isolation. ORM captures `23505` constraint violation and bubbles it natively to a `409 Conflict` gracefully on UI.
6.  **Simultaneous dispatch conflict**: Solved exclusively via DB row-locking mechanisms (`SELECT ... FOR UPDATE` in Postgres) during dispatch transaction phase. Prevents overlapping requests confirming identical resources millisecond-to-millisecond.

---

## 🚀 10. Future Scalability Notes
*   **Read-Replicas**: Offload heavy `GROUP BY` aggregations and massive CSV export functions to a Postgres Read-Replica structure to keep the main operational database latency under <50ms.
*   **Microservices Pivot**: As the system grows drastically, break `Analytics` and `Live Telematics` into separate Go or Rust services consuming data via Kafka queues.
*   **Redis Caching**: Insert Redis ahead of the `/api/dashboard/kpis` aggregation logic to cache the most complex dashboard mathematical outputs on 30s TTL rotations if concurrent user scale dictates.
