const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// Simple JSON-backed datastore (for demo only)
const BOOKS_FILE = path.join(DATA_DIR,'books.json');
const USERS_FILE = path.join(DATA_DIR,'users.json');

function readJSON(file, defaultValue){
  try {
    const raw = fs.readFileSync(file);
    return JSON.parse(raw);
  } catch(e){
    return defaultValue;
  }
}
function writeJSON(file, data){
  fs.writeFileSync(file, JSON.stringify(data,null,2));
}

// Seed books if missing
if (!fs.existsSync(BOOKS_FILE)){
  const sampleBooks = [
    {
      "isbn":"9780143127741",
      "title":"The Martian",
      "author":"Andy Weir",
      "reviews": [
        {"user":"alice","rating":5,"comment":"Loved it!"},
        {"user":"bob","rating":4,"comment":"Great sci-fi."}
      ]
    },
    {
      "isbn":"9780553382563",
      "title":"A Short History of Nearly Everything",
      "author":"Bill Bryson",
      "reviews":[]
    },
    {
      "isbn":"9780307277671",
      "title":"The Kite Runner",
      "author":"Khaled Hosseini",
      "reviews":[]
    }
  ];
  writeJSON(BOOKS_FILE, sampleBooks);
}

if (!fs.existsSync(USERS_FILE)){
  writeJSON(USERS_FILE, [
    {"username":"alice","password":"password123"}, 
    {"username":"bob","password":"password123"}
  ]);
}

// In-memory sessions map: token -> username
const sessions = {};

// --- Helper middlewares ---
function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({error:'Missing token'});
  const token = auth.slice(7);
  const user = sessions[token];
  if(!user) return res.status(401).json({error:'Invalid token'});
  req.user = user;
  next();
}

// --- API Endpoints ---

// Task 1: Get the book list available in the shop. (General users)
app.get('/api/books', (req,res) => {
  const books = readJSON(BOOKS_FILE, []);
  res.json(books);
});

// Task 2: Get the books based on ISBN.
app.get('/api/books/isbn/:isbn', (req,res) => {
  const books = readJSON(BOOKS_FILE, []);
  const book = books.find(b => b.isbn === req.params.isbn);
  if(!book) return res.status(404).json({error:'Book not found'});
  res.json(book);
});

// Task 3: Get all books by Author.
app.get('/api/books/author/:author', (req,res) => {
  const books = readJSON(BOOKS_FILE, []);
  const author = req.params.author.toLowerCase();
  const matches = books.filter(b => b.author.toLowerCase().includes(author));
  res.json(matches);
});

// Task 4: Get all books based on Title
app.get('/api/books/title/:title', (req,res) => {
  const books = readJSON(BOOKS_FILE, []);
  const title = req.params.title.toLowerCase();
  const matches = books.filter(b => b.title.toLowerCase().includes(title));
  res.json(matches);
});

// Task 5: Get book Review.
app.get('/api/books/:isbn/reviews', (req,res) => {
  const books = readJSON(BOOKS_FILE, []);
  const book = books.find(b => b.isbn === req.params.isbn);
  if(!book) return res.status(404).json({error:'Book not found'});
  res.json(book.reviews || []);
});

// Task 6: Register New user
app.post('/api/register', (req,res) => {
  const {username,password} = req.body;
  if(!username || !password) return res.status(400).json({error:'username and password required'});
  const users = readJSON(USERS_FILE, []);
  if(users.find(u=>u.username === username)) return res.status(400).json({error:'User already exists'});
  users.push({username,password});
  writeJSON(USERS_FILE, users);
  res.json({message:'Registered'});
});

// Task 7: Login as a Registered user
app.post('/api/login', (req,res) => {
  const {username,password} = req.body;
  const users = readJSON(USERS_FILE, []);
  const user = users.find(u=>u.username === username && u.password === password);
  if(!user) return res.status(401).json({error:'Invalid credentials'});
  const token = uuidv4();
  sessions[token] = username;
  res.json({token,username});
});

// Task 8: Add/Modify a book review. (Registered)
app.post('/api/books/:isbn/reviews', authMiddleware, (req,res) => {
  const {rating, comment} = req.body;
  const username = req.user;
  const books = readJSON(BOOKS_FILE, []);
  const book = books.find(b=>b.isbn === req.params.isbn);
  if(!book) return res.status(404).json({error:'Book not found'});
  // If user has review, modify it; else add
  const existing = (book.reviews || []).find(r=>r.user === username);
  if(existing){
    existing.rating = rating;
    existing.comment = comment;
  } else {
    if(!book.reviews) book.reviews = [];
    book.reviews.push({user:username, rating, comment});
  }
  writeJSON(BOOKS_FILE, books);
  res.json({message:'Review added/updated',reviews:book.reviews});
});

// Task 9: Delete book review added by that particular user
app.delete('/api/books/:isbn/reviews', authMiddleware, (req,res) => {
  const username = req.user;
  const books = readJSON(BOOKS_FILE, []);
  const book = books.find(b=>b.isbn === req.params.isbn);
  if(!book) return res.status(404).json({error:'Book not found'});
  const before = (book.reviews || []).length;
  book.reviews = (book.reviews || []).filter(r=>r.user !== username);
  writeJSON(BOOKS_FILE, books);
  const after = book.reviews.length;
  if(before === after) return res.status(404).json({error:'Review by user not found'});
  res.json({message:'Review deleted',reviews:book.reviews});
});

// Serve frontend
app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname,'public','index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Server running on port',PORT));
