const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const _Router = require("./routes/router");
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/callback", (request, response) => {
  try {
    response.status(200).sendFile(path.join(__dirname, "public/callback.html"));
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

app.use(_Router);

app.listen(PORT, () => {
  console.log(`Port running at http://localhost:${PORT}`);
});
