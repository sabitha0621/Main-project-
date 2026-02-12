const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./data.db");
// ✅ Create transaction table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    amount REAL,
    description TEXT,
    type TEXT
  )
`);

const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ JUST THIS MUCH
app.use(express.static("public"));

app.post("/contact", async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "anu425570@gmail.com",
                pass: "hrrk qcyb favc yqpw"  // Gmail app password
            }
        });

        await transporter.sendMail({
            from: email,
            to: "anu425570@gmail.com",
            subject: "New Contact Message - Janu Kitchen",
            text: `From: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
app.post("/add-transaction", (req, res) => {
  const { date, amount, description, type } = req.body;

  db.run(
    "INSERT INTO transactions (date, amount, description, type) VALUES (?, ?, ?, ?)",
    [date, amount, description, type],
    (err) => {
      if (err) {
        console.error(err);
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    }
  );
});


// 📊 Report API
app.get("/report", (req, res) => {
  const type = req.query.type;
  let query = "";

  if (type === "weekly") {
    query = `SELECT * FROM transactions WHERE date >= date('now', '-7 days')`;
  } else if (type === "monthly") {
    query = `SELECT * FROM transactions WHERE date >= date('now', '-1 month')`;
  } else if (type === "yearly") {
    query = `SELECT * FROM transactions WHERE date >= date('now', '-1 year')`;
  } else {
    query = "SELECT * FROM transactions";
  }

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      res.json([]);
    } else {
      res.json(rows);
    }
  });
});


// ✅ Weekly report
app.get("/weekly-report", (req, res) => {
  const query = `
    SELECT strftime('%W', date) AS week, SUM(amount) AS total
    FROM transactions
    GROUP BY week
    ORDER BY week DESC;
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      res.json({ success: false });
    } else {
      res.json(rows);
    }
  });
});

// ✅ Monthly report
app.get("/monthly-report", (req, res) => {
  const query = `
    SELECT strftime('%m', date) AS month, SUM(amount) AS total
    FROM transactions
    GROUP BY month
    ORDER BY month DESC;
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      res.json({ success: false });
    } else {
      res.json(rows);
    }
  });
});

// ✅ Yearly report
app.get("/yearly-report", (req, res) => {
  const query = `
    SELECT strftime('%Y', date) AS year, SUM(amount) AS total
    FROM transactions
    GROUP BY year
    ORDER BY year DESC;
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      res.json({ success: false });
    } else {
      res.json(rows);
    }
  });
});

   


