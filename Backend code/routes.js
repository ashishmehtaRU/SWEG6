const express = require("express");
const passport = require("passport");
const db = require("./db");

const router = express.Router();
const DEFAULT_LLM_MODEL = "llama3:8b";
const DEFAULT_MULTI_MODELS = ["llama3:8b", "deepseek-r1:8b", "mistral"];

const dbRun = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });

const dbGet = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

const dbAll = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

function createBatchId() {
  return `batch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function chooseBestResponse(responses) {
  let bestIndex = 0;
  let bestScore = -1;

  responses.forEach((item, index) => {
    const text = (item.response || "").trim();
    const score = text.length;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}

const generateLLMResponse = async (prompt, model, options = {}) => {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature ?? 1.0,
        top_p: options.top_p ?? 0.95,
        repeat_penalty: options.repeat_penalty ?? 1.1,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  const data = await response.json();
  return data.response || data.output || "";
};

async function generateMultipleLLMResponses(prompt, models, regenerate = false) {
  const tasks = models.map(async (modelName, index) => {
    const response = await generateLLMResponse(prompt, modelName, {
      temperature: regenerate ? 1.15 + index * 0.1 : 0.9 + index * 0.1,
      top_p: 0.95,
      repeat_penalty: 1.15,
    });

    return {
      model: modelName,
      response: response || "",
    };
  });

  return Promise.all(tasks);
}

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("/dashboard.html");
  },
);

router.get("/auth/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/auth/user", function (req, res) {
  if (req.isAuthenticated()) {
    const user = req.user;
    res.json({
      user: {
        id: user.id,
        name: user.google_id ? user.username : user.email,
        email: user.email,
        avatar: user.avatar || null,
        isGoogleUser: !!user.google_id,
      },
    });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

router.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await dbGet("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    await dbRun(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, password],
    );

    res.json({ message: "user created" });
  } catch (err) {
    console.error("Register error:", err.message);
    if (
      err.message.toLowerCase().includes("unique") ||
      err.message.toLowerCase().includes("email")
    ) {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Unable to create user" });
  }
});

router.post("/login", (req, res, next) => {
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
        req.login(row, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          res.json({ message: "successful login", user: row });
        });
      } else {
        res.status(401).json({ message: "invalid credentials" });
      }
    },
  );
});

router.post("/logout", (req, res) => {
  res.json({ message: "logout" });
});

router.post("/conversations", async (req, res) => {
  const { user_id, title, model } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id required" });
  }

  const conversationTitle = title ? title.trim() : "New Conversation";
  const conversationModel = model ? model.trim() : DEFAULT_LLM_MODEL;

  try {
    const result = await dbRun(
      "INSERT INTO conversations (user_id, title, model) VALUES (?, ?, ?)",
      [user_id, conversationTitle, conversationModel],
    );

    res.json({
      message: "conversation created",
      conversationId: result.lastID,
      title: conversationTitle,
      model: conversationModel,
    });
  } catch (err) {
    console.error("Create conversation error:", err.message);
    res.status(500).json({ error: "Unable to create conversation" });
  }
});

router.get("/conversations/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const rows = await dbAll(
      `SELECT c.id, c.user_id, c.title, c.model, c.created_at, c.updated_at,
        (SELECT content
         FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC, id DESC
         LIMIT 1) AS last_message
       FROM conversations c
       WHERE c.user_id = ?
       ORDER BY c.updated_at DESC`,
      [userId],
    );

    res.json(rows);
  } catch (err) {
    console.error("Fetch conversations error:", err.message);
    res.status(500).json({ error: "Unable to fetch conversations" });
  }
});

router.get("/conversation/:conversationId", async (req, res) => {
  const conversationId = req.params.conversationId;

  try {
    const conversation = await dbGet(
      "SELECT * FROM conversations WHERE id = ?",
      [conversationId],
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await dbAll(
      `SELECT id, role, content, model_name, batch_id, is_recommended, created_at
       FROM messages
       WHERE conversation_id = ?
       ORDER BY created_at ASC, id ASC`,
      [conversationId],
    );

    res.json({ conversation, messages });
  } catch (err) {
    console.error("Fetch conversation error:", err.message);
    res.status(500).json({ error: "Unable to fetch conversation" });
  }
});

router.post("/conversation/:conversationId/message", async (req, res) => {
  const conversationId = req.params.conversationId;
  const { prompt, model, resetConversation } = req.body;

  if (!prompt || !prompt.toString().trim()) {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    const conversation = await dbGet(
      "SELECT * FROM conversations WHERE id = ?",
      [conversationId],
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const requestedModel = model
      ? model.trim()
      : conversation.model || DEFAULT_LLM_MODEL;

    const shouldReset =
      resetConversation === true || requestedModel !== conversation.model;

    if (shouldReset) {
      await dbRun("DELETE FROM messages WHERE conversation_id = ?", [
        conversationId,
      ]);
    }

    await dbRun(
      "UPDATE conversations SET model = ?, updated_at = datetime('now') WHERE id = ?",
      [requestedModel, conversationId],
    );

    await dbRun(
      "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
      [conversationId, "user", prompt],
    );

    const output = await generateLLMResponse(prompt, requestedModel);

    await dbRun(
      "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)",
      [conversationId, "assistant", output],
    );

    res.json({
      message: "response generated",
      prompt,
      response: output,
      model: requestedModel,
      reset: shouldReset,
    });
  } catch (err) {
    console.error("Conversation message error:", err.message);
    res.status(500).json({ error: "Unable to generate response" });
  }
});

router.post("/conversation/:conversationId/multi-response", async (req, res) => {
  const conversationId = req.params.conversationId;
  const { prompt, models, regenerate } = req.body;

  if (!prompt || !prompt.toString().trim()) {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    const conversation = await dbGet(
      "SELECT * FROM conversations WHERE id = ?",
      [conversationId],
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const selectedModels =
      Array.isArray(models) && models.length === 3
        ? models.map((m) => m.toString().trim())
        : DEFAULT_MULTI_MODELS;

   const batchId = createBatchId();
   const cleanPrompt = prompt.toString().trim();

    await dbRun(
      `INSERT INTO messages (conversation_id, role, content, batch_id)
      VALUES (?, ?, ?, ?)`,
      [conversationId, "user", cleanPrompt, batchId],
    );

  const variedPrompt =
  regenerate === true
    ? `Answer the same request in a different style or wording than before.\n\n${cleanPrompt}`
    : cleanPrompt;

const results = await generateMultipleLLMResponses(
  variedPrompt,
  selectedModels,
  regenerate === true
);

    const bestIndex = chooseBestResponse(results);

    for (let i = 0; i < results.length; i += 1) {
      const item = results[i];
      await dbRun(
        `INSERT INTO messages (conversation_id, role, content, model_name, batch_id, is_recommended)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          conversationId,
          "assistant",
          item.response,
          item.model,
          batchId,
          i === bestIndex ? 1 : 0,
        ],
      );
    }

    await dbRun(
      "UPDATE conversations SET updated_at = datetime('now') WHERE id = ?",
      [conversationId],
    );

    res.json({
      message: regenerate ? "responses regenerated" : "responses generated",
      conversationId: Number(conversationId),
      batchId,
      prompt: cleanPrompt,
      recommendedIndex: bestIndex,
      responses: results.map((item, index) => ({
        model: item.model,
        response: item.response,
        recommended: index === bestIndex,
      })),
    });
  } catch (err) {
    console.error("Multi-response error:", err.message);
    res.status(500).json({ error: "Unable to generate responses" });
  }
});

router.patch("/conversation/:conversationId/model", async (req, res) => {
  const conversationId = req.params.conversationId;
  const { model, reset } = req.body;

  if (!model || !model.toString().trim()) {
    return res.status(400).json({ error: "model required" });
  }

  try {
    const conversation = await dbGet(
      "SELECT * FROM conversations WHERE id = ?",
      [conversationId],
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const normalizedModel = model.toString().trim();
    const shouldReset =
      reset === true || conversation.model !== normalizedModel;

    if (shouldReset) {
      await dbRun("DELETE FROM messages WHERE conversation_id = ?", [
        conversationId,
      ]);
    }

    await dbRun(
      "UPDATE conversations SET model = ?, updated_at = datetime('now') WHERE id = ?",
      [normalizedModel, conversationId],
    );

    res.json({
      message: "conversation model updated",
      conversationId: Number(conversationId),
      model: normalizedModel,
      reset: shouldReset,
    });
  } catch (err) {
    console.error("Update conversation model error:", err.message);
    res.status(500).json({ error: "Unable to update conversation model" });
  }
});

router.get("/conversations/search/:userId", async (req, res) => {
  const userId = req.params.userId;
  const queryText = req.query.q ? req.query.q.trim() : "";

  try {
    if (!queryText) {
      const rows = await dbAll(
        `SELECT c.id, c.user_id, c.title, c.model, c.created_at, c.updated_at,
          (SELECT content
           FROM messages
           WHERE conversation_id = c.id
           ORDER BY created_at DESC, id DESC
           LIMIT 1) AS last_message
         FROM conversations c
         WHERE c.user_id = ?
         ORDER BY c.updated_at DESC`,
        [userId],
      );
      return res.json(rows);
    }

    const rows = await dbAll(
      `SELECT m.id AS message_id,
              c.id AS conversation_id,
              c.title AS conversation_title,
              m.role,
              m.content,
              m.created_at
       FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE c.user_id = ? AND m.content LIKE ?
       ORDER BY m.created_at DESC`,
      [userId, `%${queryText}%`],
    );

    res.json(rows);
  } catch (err) {
    console.error("Search conversations error:", err.message);
    res.status(500).json({ error: "Unable to search conversations" });
  }
});

router.post("/llm/infer", async (req, res) => {
  const { prompt, model } = req.body;

  if (!prompt || !prompt.toString().trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model ? model.trim() : DEFAULT_LLM_MODEL,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ output: data.response });
  } catch (error) {
    console.error("LLM inference error:", error.message);
    res.status(500).json({
      error: "Failed to connect to Ollama. Make sure Ollama is running.",
    });
  }
});

router.post("/reviews", (req, res) => {
  const author =
    req.body.author ||
    (req.body.user_id ? `user_${req.body.user_id}` : "anonymous");
  const rating = req.body.rating != null ? req.body.rating : null;
  const text = req.body.text || req.body.review_text;

  if (!text || !text.toString().trim()) {
    return res.status(400).json({ error: "Review cannot be blank" });
  }

  const normalizedText = text.toString().trim();

  db.run(
    "INSERT INTO reviews (author, rating, text) VALUES (?, ?, ?)",
    [author, rating, normalizedText],
    function (err) {
      if (err) {
        console.error("Create review error:", err.message);
        return res.status(500).json({ error: "Unable to save review" });
      }

      res.json({
        message: "review submitted",
        id: this.lastID,
        author,
        rating,
        review_text: normalizedText,
      });
    },
  );
});

router.get("/reviews", (req, res) => {
  db.all(
    "SELECT id, author, rating, text AS review_text, created_at FROM reviews ORDER BY created_at DESC LIMIT 20",
    [],
    (err, rows) => {
      if (err) {
        console.error("Fetch reviews error:", err.message);
        return res.status(500).json({ error: "Unable to fetch reviews" });
      }
      res.json({ reviews: rows });
    },
  );
});

module.exports = router;