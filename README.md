# Monitoring and Progress Evaluation System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)

![System Dashboard Preview](public/screenshot.png)


A comprehensive agricultural loan management and progress tracking system designed to streamline financial operations for farmers, bank officers, buyers, and administrators.

## Table of Contents
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

### Role-Based Access
- 👨‍🌾 **Farmers**: Apply for loans, track repayments, view progress
- 🏦 **Bank Officers**: Approve/reject loans, monitor repayments
- 🛒 **Buyers**: View farmer produce, track transactions
- 👨‍💼 **Admins**: Manage users, view system analytics Dashboard

### Core Functionality
- **Loan Management**: Application, approval, and tracking
- **Repayment System**: Visual progress tracking with payment history
- **Profile Management**: Personal info and password updates
- **Progress Monitoring**: Performance metrics and financial health tracking
- **Session Management**: Secure authentication with 7-day persistence

## Installation

Follow these steps to set up the project locally:

### Prerequisites
- Node.js v18+
- npm v9+
- Git

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/onoja5/AgriLoan.git
   cd AgriLoan

Install dependencies:

bash
npm install
Set up environment variables:
Create a .env file in the root directory with:

env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="Monitoring and Progress Evaluation"
Start the development server:

bash
npm run dev
Access the application:
Open http://localhost:5173 in your browser

Usage
Key Navigation Paths
Login Page: /auth

Farmer Dashboard: /farmer

Bank Officer Dashboard: /bank

Buyer Dashboard: /buyer

Admin Dashboard: /admin

User Profile: /profile

Loan Repayment: /[role]/repayment/[loanId]

Workflow Examples
Applying for a loan (Farmer)

Login as farmer

Navigate to dashboard

Click "Apply for Loan"

Fill details and submit

Approving a loan (Bank Officer)

Login as bank officer

Review pending applications

Approve/reject with comments

Notify farmer of decision

Making a repayment (Farmer)

Select active loan from dashboard

Click "Make Payment"

Enter amount and confirm

Technology Stack
Frontend
React (v18.2.0)

TypeScript (v5.0.0)

Vite (v4.4.0)

Tailwind CSS (v3.3.0)

React Router (v6.0.0)

State Management
React Context API

LocalStorage for session persistence

Contributing
We welcome contributions! Please follow these steps:

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

License
Distributed under the MIT License. See LICENSE for more information.

Contact
Onoja Matthew

GitHub: @onoja5

Email: onoja16@gmail.com

Project Link: https://github.com/onoja5/AgriLoan