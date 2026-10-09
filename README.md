# Task Management System

SDC Project Review-1 | HTML + CSS + JavaScript Only

## Project Description

Task Management is a browser-based application that helps administrators and users create, assign, monitor and update tasks.

## Problem Statement

Managing tasks manually can make it difficult to track deadlines, priorities, task ownership and completion status. The system provides a centralized interface for organizing tasks and monitoring progress.

## Modules

### 1. Admin Module
- Admin login
- Admin dashboard
- View registered users
- Delete users
- View all tasks
- Add, edit and delete tasks
- Assign tasks to users
- Monitor task statistics

### 2. User Module
- User signup/login
- User dashboard
- View assigned tasks
- Add tasks
- Edit assigned tasks
- Update task status
- Search tasks
- Logout

## Technologies

Only the technologies permitted by the SDC requirements are used:
- HTML5
- CSS3
- JavaScript
- Browser Local Storage

No backend, database, framework or external library is required.

## SDC Requirement Mapping

1. Problem statement: included in project documentation.
2. Minimum two modules: Admin Module and User Module.
3. Complete application: HTML, CSS and JavaScript only.
4. UI: CSS Grid and Flexbox are used.
5. Signup/Login: user accounts and session are stored in Local Storage.
6. Module navigation: JavaScript role-based navigation displays Admin/User modules.
7. Major functions: authentication, task creation, editing, assignment, search, status and deletion are implemented.
8. GitHub: project contains independent HTML/CSS/JS files and README, ready to push to a repository.
9. Demonstration: demo accounts and application flow are documented below.

## Demo Credentials

Admin:
- Username: `admin`
- Password: `admin123`

User:
- Username: `user`
- Password: `user123`

## How to Run

1. Download or clone the repository.
2. Open `index.html` in a modern web browser.
3. Login using a demo account or create a new account through Sign Up.
4. Demonstrate the Admin and User modules.

## Local Storage Keys

- `tm_users` - registered users
- `tm_tasks` - task records
- `tm_session` - current login session

## GitHub Upload

Create a GitHub repository named `task-management`.

Then run:

```bash
git init
git add .
git commit -m "Initial Task Management SDC project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/task-management.git
git push -u origin main
```

## Important Academic Note

This project uses client-side Local Storage because the SDC requirement permits only HTML, CSS and JavaScript. The passwords are therefore stored locally in the browser and this implementation should be considered an academic/demo application, not a production authentication system.
