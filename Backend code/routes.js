const express = require("express");
const db = require("./db");

const router = express.Router();

router.post("/register", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password],
    function (err) {
      if (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "user created" });
      }
    },
  );
});

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, row) => {
      if (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ error: err.message });
      } else if (row) {
        res.json({ message: "successful login", user: row });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    },
  );
});

router.post("/logout", (req, res) => {
  res.json({ message: "logout" });
});

router.post("/llm/infer", (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  const output = "AI Response: " + prompt;
  res.json({ message: output });
});

router.post("/signup", (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.run(
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
    [username, email, password],
    function (err) {
      if (err) {
        console.error("Signup error:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "user created" });
    }
  );
});

router.post("/conversations", (req, res) => {
  const { user_id, title } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id required" });
  }

  db.run(
    "INSERT INTO conversations (user_id, title) VALUES (?, ?)",
    [user_id, title || "New Conversation"],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "conversation created", conversationId: this.lastID });
    }
  );
}
);


router.get("/conversations/search/:userId", (req, res) => {
  const q = req.query.q || "";

  db.all(
    `
    SELECT DISTINCT c.*
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id
    WHERE c.user_id = ?
      AND (c.title LIKE ? OR m.content LIKE ?)
    ORDER BY c.updated_at DESC
    `,
    [req.params.userId, `%${q}%`, `%${q}%`],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
}
);


router.get("/conversations/:userId", (req, res) => {
  db.all(
    "SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC",
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
}
);

router.get("/conversation/:id", (req, res) => {
  db.all(
    "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
}
);


router.get("/reviews", (req, res) => {
  db.all(
    "SELECT * FROM reviews ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
}
);
router.post("/conversation/:id/message", (req, res) => {
  const { prompt } = req.body;
  const conversationId = req.params.id;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt required" });
  }

  db.run(
    "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
    [conversationId, "user", prompt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });

      const aiResponse = "AI Response: " + prompt;

      db.run(
        "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
        [conversationId, "assistant", aiResponse],
         function (err2) {
             if (err2) return res.status(500).json(
              { error: err2.message }
            );

          db.run(
            "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [conversationId]
          );

          res.json({
            message: "response generated",
            prompt,
            response: aiResponse
          });
        }
      );
    }
  );
}
);

router.post("/reviews", (req, res) => {
  const { user_id, review_text } = req.body;

  if (!review_text || !review_text.trim()) {
    return res.status(400).json({ error: "Review cannot be blank" });
  }

  db.run(
    "INSERT INTO reviews (user_id, review_text) VALUES (?, ?)",
    [user_id || null, review_text],
      function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: "review submitted" });
    }
  );
}
);

module.exports = router;