# ⚡ PulseMarket – Fullstack E-Commerce Platform

![PulseMarket Logo](./back-end/public/images/logo.png)

![Node.js](https://img.shields.io/badge/Node.js-v20.11.1-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-Backend-000000?logo=express&logoColor=white) ![Sequelize](https://img.shields.io/badge/Sequelize-ORM-blueviolet?logo=sequelize) ![MySQL](https://img.shields.io/badge/MySQL-Database-orange?logo=mysql) ![Express](https://img.shields.io/badge/Express-Frontend-000000?logo=express&logoColor=white) ![EJS](https://img.shields.io/badge/EJS-Templates-yellow?logo=ejs) ![Bootstrap](https://img.shields.io/badge/Bootstrap-5-purple?logo=bootstrap) ![Swagger](https://img.shields.io/badge/Swagger-API--Docs-lightgrey?logo=swagger) ![Jest](https://img.shields.io/badge/Tests-Jest%20+%20Supertest-red?logo=jest) ![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red)

PulseMarket is a fullstack e-commerce platform built using Node.js, Express, MySQL, and EJS.
This project was developed as part of the final exam for Noroff’s Back-End Development course (BED1).

---

## 📂 Project Overview

This platform is divided into two core applications:

- 🖙 [Back-End API (Express + Sequelize + MySQL)](./back-end/README.md)
- 🖜 [Front-End Admin Panel (Express + EJS + Bootstrap)](./front-end/README.md)

---

## 📄 Documentation

> ℹ️ **Note**: The Back-End API must be running at `http://localhost:3000` for the API documentation to load properly.

| Resource                   | Location                                                                |
| -------------------------- | ----------------------------------------------------------------------- |
| 📝 Reflection Report (PDF) | [`/documentation/reflection.pdf`](./documentation/reflection.pdf)       |
| ✨ ERD Diagram             | [`/documentation/erd-diagram.png`](./documentation/erd-diagram.png)     |
| 🗽 Jira Timeline           | [`/documentation/jira-timeline.png`](./documentation/jira-timeline.png) |
| 📚 API Documentation       | [`http://localhost:3000/doc`](http://localhost:3000/doc)                |

---

## 📦 Tech Summary

- Node.js, Express.js, Sequelize, MySQL
- JWT authentication
- EJS templating, Bootstrap 5 styling
- Full CRUD for products, categories, brands, orders, and users
- Membership system with dynamic discounts
- Role-based admin panel
- Swagger UI API documentation
- Jest + Supertest test suite

---

## 📁 Project Structure

```plaintext
/
├── back-end/           # Back-End API (Express, Sequelize, MySQL)
├── front-end/          # Front-End Admin Panel (EJS, Bootstrap)
├── documentation/      # Exam documentation (PDF, ERD, Jira timeline)
├── .gitignore          # Git ignore rules
└── README.md           # Top-level project README (this file)
```

Make sure `.gitignore` excludes the following sensitive and irrelevant files:

```gitignore
.history
node_modules
.env
```

---

## 🥏 REFERENCES

This project was developed by me, **Rune Unhjem**, with guidance from various technical resources.
All implementation logic, structure, and testing were written and verified by me.

### AI Assistance (ChatGPT)

- Code generation ideas, structure, and syntax validation (back-end)
- EJS layout and Bootstrap structure suggestions (front-end)
- Swagger documentation formatting
- Validator and test case inspiration
  _Used strictly as development support; all final implementations were authored, verified, and adapted by me._

### Forums & Official Docs

- [Stack Overflow](https://stackoverflow.com/) – Specific Express/Sequelize implementation guidance
- [MDN Web Docs](https://developer.mozilla.org/) – Reference for JS fundamentals and array/object methods
- [Bootstrap Docs](https://getbootstrap.com/) – Component and responsive layout reference

### Personal Help

- None — this project was completed independently.

---

## 📗 Author

**Rune Unhjem**

- 🌐 [Portfolio](https://rundev-portfolio.netlify.app/)
- 🤝 GitHub: [@runeunhjem](https://github.com/runeunhjem)
- 💼 LinkedIn: [runeunhjem](https://www.linkedin.com/in/runeunhjem/)
