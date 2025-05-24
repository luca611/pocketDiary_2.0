![Pocket dIAry Banner](./banner.png)

# 📘 Pocket dIAry

Welcome to **Pocket dIAry**, your personal digital assistant built to make student life smarter, simpler, and stress-free.

Whether you're planning your week, tracking grades, logging study hours, or organizing notes, Pocket dIAry has your back — all wrapped in a sleek, privacy-first PWA experience.

---

## 🚀 Get Started

Pick the installation method that works best for you:

* 📥 [**Manual Installation Guide**](./README.manual.md) — for full control and custom setups
* 🐳 [**Docker Installation Guide**](./README.docker.md) — the fastest and easiest way to deploy

---

## ✨ Features at a Glance

* 📅 Clean, interactive calendar
* 🧠 AI-powered study planner
* 📝 Personal notes and to-dos
* 📊 Grade & attendance tracking

---

## 📁 Project Overview

```
pocketdiary/
├── controllers/        # API route controllers (hours, marks, notes, users)
│   ├── hours.mjs
│   ├── marks.mjs
│   ├── notes.mjs
│   └── user.mjs
├── db/
│   └── dbClient.mjs    # PostgreSQL connection client
├── node_modules/
├── PocketAi/
│   └── chat.mjs        # AI assistant logic
├── public/
│   ├── bootstrap/      # UI dependencies
│   ├── libs/           # External libraries
│   ├── resources/
│   ├── .deepsource.toml
│   ├── app.js
│   ├── favicon.png
│   ├── index.html
│   ├── manifest.json
│   ├── pwaicon.png
│   ├── pwaversion.txt
│   ├── style.css
│   └── sw.js           # PWA service worker
├── security/
│   └── encryption.mjs  # Encryption utilities
├── utils/
│   ├── returns.mjs
│   ├── serverUtils.mjs
│   ├── validator.mjs
│   └── vars.mjs
├── .env
├── .gitignore
├── index.mjs           # Main entry point
├── LICENSE
├── package-lock.json
├── package.json
├── Dockerfile
├── docker-compose.yml
├── README.md
├── README.manual.md
├── README.docker.md
└── banner.png
```

---

## 🤝 Contribute

Found a bug? Got an idea? Want to help out?

We welcome all contributions — just fork the repo, create a branch, and submit a pull request. Let’s build something great together!

---

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for more info.

---

Thank you for choosing **Pocket dIAry**. Stay organized. Stay ahead.
