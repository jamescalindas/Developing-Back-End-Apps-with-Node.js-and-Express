Bookshop Project (Demo)
=======================

What is included:
- server.js : Express API that implements Tasks 1-9
- public/    : Front-end files (index.html, styles.css, app.js)
- client_node/client.js : Node.js client demonstrating Tasks 10-13 using Axios
- data/      : JSON data files (books.json, users.json)
- package.json : Node dependencies (express, axios, cors, uuid, body-parser)

How to run:
1. Extract the ZIP and in the project folder run:
   npm install
   node server.js
2. Open your browser at http://localhost:3000 to use the frontend.
3. To run the Node client demo (after server is running):
   node client_node/client.js

Notes:
- This is a demo project for coursework. Authentication uses a simple token (uuid) and user passwords are stored in plaintext in data/users.json for simplicity. Do NOT use this in production.
