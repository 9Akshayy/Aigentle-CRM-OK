# ⚡ Aigentle IT Services CRM - Lead Management Platform

A high-performance, modern Web CRM tailored specifically for **Aigentle IT Services** to track, nurture, and close enterprise IT deals efficiently.

---

## 🚀 Quick Start

### 1. Launch Production App (Single Command)
```bash
npm start
```
The CRM will be live at: **`http://localhost:5000`** (Serving both the REST API and the React SPA).

### 2. Launch Development Mode (Hot Reloading)
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend Vite**: `http://localhost:3000` (with live reload & API proxy)

---

## 🎯 Key Features

### 1. 📌 Visual Kanban Pipeline
- **7 Industry Stages**: New Leads ➔ Contacted ➔ Qualified ➔ Proposal Sent ➔ Negotiation ➔ Closed Won ➔ Closed Lost.
- **Drag & Drop**: Native drag-and-drop between stages with stage deal value totals.
- **Deal Sizing & Probability**: Live forecast probability calculation with win celebration confetti on "Closed Won".

### 2. 📋 Interactive Leads Table View
- Sortable by Company, Contact, Service, Deal Value, Stage, Priority, and Next Follow-up.
- Filter by Service, Urgency/Priority, and Account Owner.
- **Bulk Operations**: Bulk stage movement, bulk deletion, and bulk selection.

### 3. 🔍 360-Degree Lead Profile Drawer
- Complete contact info with 1-click **Call (`tel:`)**, **Email (`mailto:`)**, and **WhatsApp** chat triggers.
- **Touchpoint History & Timeline**: Log phone calls, meeting notes, proposals sent, and stage changes.
- **Follow-up Reminders**: Schedule upcoming dates with overdue warnings so no deal falls through the cracks.
- Quick stage progression stepper.

### 4. 📊 Pipeline Analytics & Forecasting
- **Stage Funnel**: Visual stage-by-stage conversion metrics.
- **Revenue by IT Service Offering**: Distribution across AI & Machine Learning, Cloud & DevOps, Custom Software, Cybersecurity, Mobile Dev, and Managed Support.
- **Acquisition Channels**: Track ROI on LinkedIn, Referrals, Website Inquiries, Google Ads, and Events.
- **Win Ratio**: Calculated percentage of closed-won vs closed-lost deals.

### 5. ⏰ Follow-up & Task Agenda
- Dedicated reminders center categorizing **Overdue**, **Today**, **Upcoming**, and **Completed** tasks.
- Directly links tasks to company decision-makers with 1-click call/email buttons.

### 6. 📑 IT Proposal & Email Generator
- Built-in templates for IT Services:
  - AI & Automation Architecture Discovery Follow-up
  - Cloud Architecture & DevOps Modernization Scope
  - Custom Software MVP Engineering Proposal
  - Re-engagement & Inactive Lead Check-in
- Auto-populates client variables (`{{company_name}}`, `{{contact_person}}`, `{{service}}`, `{{deal_value}}`, `{{owner}}`).
- 1-click **Copy to Clipboard** and **Launch Email Client**.

### 7. 📥 CSV Import & Export
- **Export**: One-click download of all leads with full metadata to CSV.
- **Import**: Drag-and-drop CSV importer with column auto-mapping and preview table.
- **Sample Template**: Downloadable sample CSV for easy formatting.

---

## 🗄️ Tech Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend**: Express.js REST API.
- **Database**: SQLite with `better-sqlite3` (WAL mode enabled for fast ACID transactions). Stored in `data/crm.db`.
- **Zero Configuration**: Ready out-of-the-box with realistic sample IT leads for Aigentle.
