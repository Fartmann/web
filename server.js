require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key";

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'lab2')));

mongoose.connect('mongodb+srv://adamsatyshev10:skLZeav4NKdyvovk@cluster0.yumpv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(express.static(path.join(__dirname, 'assign4')));

//schemas
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model("User", UserSchema);

const TaskSchema = new mongoose.Schema({
  userId: String,
  title: String,
  description: String
});
const Task = mongoose.model("Task", TaskSchema);

//authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token required" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.user = user;
      next();
  });
}

//registration
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  if (await User.findOne({ username })) return res.status(400).json({ error: "User already exists" });

  await new User({ username, password: hashedPassword }).save();
  res.json({ message: "User registered successfully" });
});

//login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

//routes
app.get("/tasks", authenticateToken, async (req, res) => {
  res.json(await Task.find({ userId: req.user.userId }));
});

app.post("/tasks", authenticateToken, async (req, res) => {
  await new Task({ userId: req.user.userId, title: req.body.title, description: req.body.description }).save();
  res.json({ message: "Task added" });
});

app.put("/tasks/:id", authenticateToken, async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, req.body);
  res.json({ message: "Task updated" });
});

app.delete("/tasks/:id", authenticateToken, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
