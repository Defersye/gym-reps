const express = require("express");
const bodyParser = require("body-parser");
const db = require("./js/db");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("."));

function calculateTotalCount(sets) {
   if (!sets || sets.length === 0) {
      return 0;
   }
   return sets.reduce((sum, set) => sum + set, 0);
}

// Получение списка упражнений
app.get("/exercises", (req, res) => {
   db.all("SELECT * FROM exercises", [], (err, rows) => {
      if (err) {
         console.error(err.message);
         res.status(500).send("Server error");
      } else {
         // вычисляем count
         const exercises = rows.map((row) => {
            const sets = JSON.parse(row.sets || "[]");
            const count = calculateTotalCount(sets);
            return { ...row, count: count };
         });
         res.json(exercises);
      }
   });
});

// Получение конкретного упражнения
app.get("/exercises/:id", (req, res) => {
   const id = req.params.id;
   db.get("SELECT * FROM exercises WHERE id = ?", [id], (err, row) => {
      if (err) {
         console.error(err.message);
         res.status(500).send("Server error");
      } else {
         if (row) {
            // Преобразуем sets из текста в массив JS
            try {
               row.sets = JSON.parse(row.sets);
            } catch (e) {
               row.sets = [];
            }
            const count = calculateTotalCount(row.sets);
            row.count = count;
            res.json(row);
         } else {
            res.status(404).send("Exercise is not found");
         }
      }
   });
});

// Добавление нового упражнения
app.post("/exercises", (req, res) => {
   const { name } = req.body;
   db.run("INSERT INTO exercises (name) VALUES (?)", [name], function (err) {
      if (err) {
         console.error(err.message);
         res.status(500).send("Server error");
      } else {
         res.status(201).json({ id: this.lastID });
      }
   });
});

// Сохранение прогресса упражнения
app.put("/exercises/:id", (req, res) => {
   const id = req.params.id;
   const { name, set } = req.body;

   if (name) {
      db.run(
         "UPDATE exercises SET name = ? WHERE id = ?",
         [name, id],
         (err) => {
            if (err) {
               console.error(err.message);
               res.status(500).send("Server error");
            } else {
               res.sendStatus(200);
            }
         }
      );
   } else if (set !== undefined) {
      db.get("SELECT sets FROM exercises WHERE id = ?", [id], (err, row) => {
         if (err) {
            console.error(err.message);
            res.status(500).send("Server error");
         } else {
            const sets = JSON.parse(row.sets);
            sets.push(set); // Добавляем новый сет
            const setsString = JSON.stringify(sets);
            db.run(
               "UPDATE exercises SET sets = ? WHERE id = ?",
               [setsString, id],
               (err) => {
                  if (err) {
                     console.error(err.message);
                     res.status(500).send("Server error");
                  } else {
                     res.sendStatus(200);
                  }
               }
            );
         }
      });
   }
});

// Удаление упражнения
app.delete("/exercises/:id", (req, res) => {
   const id = req.params.id;
   db.run("DELETE FROM exercises WHERE id = ?", [id], function (err) {
      if (err) {
         console.error(err.message);
         res.status(500).send("Server error");
      } else {
         res.sendStatus(200);
      }
   });
});

app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});
