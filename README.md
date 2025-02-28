# Pocket Diary

## Overview

Pocket Diary is a progressive web application (PWA) designed to assist students in managing their study plans efficiently. It integrates AI-powered automation to generate personalized study schedules while also functioning as a virtual assistant. Additionally, the application provides advanced grade tracking with interactive, responsive charts and other essential academic tools.

## Features

- **AI-Powered Study Planner** – Automatically generates customized study plans based on a student's schedule and workload.
- **Smart Assistant** – Provides reminders, study tips, and helps students stay on track with their academic goals.
- **Grade Tracking** – Features dynamic, responsive charts to monitor progress and performance over time.
- **User-Friendly Interface** – A clean, intuitive design optimized for both desktop and mobile devices.
- **PWA Capabilities** – provides fast load times, and ensures a seamless user experience across different platforms.

## User Installation

1. Open the Pocket Diary web app in your browser.
2. Click on the install prompt if available, or manually add it to your home screen.
3. Enjoy enhanced performance as a standalone app.

## Server Installation

1. Clone the repository:
   `git clone https://github.com/yourusername/pocket-diary.git`
   
2. Navigate to the project directory:
   `cd pocket-diary`
   
3. Install dependencies:
   `npm install`
   
4. Set up Ai assistant:
   - in the .env file create or update AI_API_KEY =  `your ai api key here`
     - you can get one on [Groq](https://console.groq.com/playground)
   
6. Set up the PostgreSQL database:
- Create a new database in PostgreSQL and create a databse with the following tables:
- notes table
```sql
CREATE TABLE note (
    titolo VARCHAR(128) NOT NULL,
    testo VARCHAR(2048) NOT NULL,
    dataora DATE NOT NULL,
    idstudente VARCHAR(128) NOT NULL,
    id SERIAL PRIMARY KEY,
    CONSTRAINT onStudentDeleteModify FOREIGN KEY (idstudente)
        REFERENCES public.studenti (email)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX note_pkey ON note USING BTREE (id);


CREATE UNIQUE INDEX note_pkey ON note USING BTREE (id);
```
- schedule table
```sql
CREATE TABLE ore (
    descrizione VARCHAR(2048) NOT NULL,
    giorno DATE NOT NULL,
    ora INTEGER NOT NULL,
    idstudente VARCHAR(128) NOT NULL,
    id SERIAL PRIMARY KEY,
    CONSTRAINT onStudentDeleteModify FOREIGN KEY (idstudente)
        REFERENCES public.studenti (email)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX ore_pkey ON ore USING BTREE (id);
```
- students
```sql
CREATE TABLE studenti (
    email VARCHAR(128) PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    ntema INTEGER NOT NULL,
    nome VARCHAR(128) NOT NULL,
    chiave VARCHAR(256) NOT NULL,
    hexcustom VARCHAR(32)
);

ALTER TABLE studenti
ADD CONSTRAINT studenti_pkey PRIMARY KEY (email);

CREATE UNIQUE INDEX studenti_pkey ON studenti (email) USING BTREE;
```
- marks table

```sql
CREATE TABLE voti (
    voto INTEGER NOT NULL,
    titolo VARCHAR(128),
    materia VARCHAR(128),
    data DATE NOT NULL,
    tipologia VARCHAR(128),
    idstudente VARCHAR(128),
    id SERIAL PRIMARY KEY,
    CONSTRAINT onStudentDeleteModify FOREIGN KEY (idstudente)
        REFERENCES public.studenti (email)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT voti_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX voti_pkey ON voti USING BTREE (id);
```
- update or create the .env if not done already with DATABASE_URL = `your database connection here`
     - you can host one for free on [Neon](https://neon.tech)
  
7. Run the server:
   `npm start`
   - errors will be shown in the console with missing .env fields on first launch, follow the instructions given in the logs

9. The server should now be running, and the app will be accessible at `http://localhost:3000` (or whichever port you've configured).

## Technologies Used

- **Frontend**: Pure JavaScript, HTML, CSS (with boostrap, markdown-it and chart-js libs)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **AI Integration**: Custom AI algorithms for study planning
  
## Future Improvements

- Enhanced AI recommendations based on learning patterns.
- Integration with calendar apps for seamless scheduling.
- Collaboration features for group study sessions.

## Contribution

Contributions are welcome! If you’d like to improve Pocket Diary, feel free to submit a pull request or report issues.

## License

This project is licensed under the MIT License.
