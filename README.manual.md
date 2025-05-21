# 📥 Manual Installation Guide for Pocket dIAry

This guide will walk you through installing Pocket dIAry manually on your system without Docker.

---

## 🧩 Requirements

Before you begin, make sure you have the following installed:

* Node.js (v18 or later)
* npm (Node Package Manager)
* PostgreSQL (v13 or later)
* Git (optional but recommended)

---

## 📁 Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/pocketdiary.git
cd pocketdiary
```

If you're copying files manually instead of using Git, place them all in a folder named `pocketdiary`.

---

## 📦 Step 2: Install Dependencies

```bash
npm install
```

---

## 🗃️ Step 3: Configure the Environment

Create a `.env` file in the root directory and fill it with the following variables:

### ✅ Required:

```env
AI_API_KEY=your_api_key              # Obtainable for free at https://groq.com
DATABASE_URL=your_database_url      # e.g. postgres://user:pass@localhost:5432/pocketdiary
ENCRYPTION_KEY=your_encryption_key  # Obtainable from https://pocketdiary.tech/getKey
```

### ⚙️ Recommended:

```env
CORS_ORIGIN=*                       # Set your frontend origin here (default: *)
SESSION_DURATION=3600000           # Session duration in ms (default: 1 hour)
SESSION_SECRET=your_secret_value   # Random secret string for session management
PORT=3000                           # Port to run the server (default: 3000)
```

> Tip: Do not share your `.env` file or commit it to version control!

---

## 🧱 Step 4: Set Up the Database

1. Open your PostgreSQL client (like `psql` or pgAdmin).
2. Create a new database:

```sql
CREATE DATABASE pocketdiary;
```

3. Execute the SQL schema located in the `./db/tables.sql` file:

```bash
psql -U your_postgres_user -d pocketdiary -f db/tables.sql
```

This will create the necessary tables:

* `students`
* `hours`
* `marks`
* `notes`

Each table is already configured with relationships and constraints.

---

## ▶️ Step 5: Start the Server

```bash
node index.mjs
```

The server should now be running on [http://localhost:3000](http://localhost:3000).

---

## 🌐 Access the App

Open your browser and visit:

```
http://localhost:3000
```

You should see the Pocket dIAry frontend loaded and ready to use.

---

## 🛠 Optional Tips

* For development, consider using `nodemon`:

  ```bash
  npx nodemon index.mjs
  ```

* To expose the server to your local network, change the `HOST` value in your code to `0.0.0.0` (if supported).

---

## ✅ Done!

You’ve successfully installed Pocket dIAry manually. 🎉

If you encounter issues, feel free to check the issue tracker or contribute with a fix!
