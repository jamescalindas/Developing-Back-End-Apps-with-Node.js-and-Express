/**
 Node.js client demonstrating the 4 required methods using Axios.
 - Task 10: getAllBooksCallback(callback) -- uses callback-style + axios promise then()
 - Task 11: searchByISBNPromise(isbn) -- returns a Promise
 - Task 12: searchByAuthorPromise(author) -- returns a Promise (chain)
 - Task 13: searchByTitleAsync(title) -- uses async/await
 Usage: node client_node/client.js
 Note: The server must be running (node server.js) for these to work.
*/
const axios = require('axios');
const BASE = 'http://localhost:3000/api';

function getAllBooksCallback(cb){
  // Task 10: Using a callback-style function that internally uses axios then()
  axios.get(BASE + '/books')
    .then(resp => cb(null, resp.data))
    .catch(err => cb(err));
}

function searchByISBNPromise(isbn){
  // Task 11: Using Promises
  return axios.get(BASE + '/books/isbn/' + encodeURIComponent(isbn))
    .then(r => r.data);
}

function searchByAuthorPromise(author){
  // Task 12: Using Promises (chain)
  return axios.get(BASE + '/books/author/' + encodeURIComponent(author))
    .then(r => r.data);
}

async function searchByTitleAsync(title){
  // Task 13: Using async/await
  const resp = await axios.get(BASE + '/books/title/' + encodeURIComponent(title));
  return resp.data;
}

// Demo runner
async function runDemo(){
  console.log('--- Task 10: getAllBooksCallback ---');
  getAllBooksCallback((err,data)=>{
    if(err) return console.error('Callback error:', err.message || err);
    console.log('Books:', data);
  });

  console.log('\n--- Task 11: searchByISBNPromise ---');
  searchByISBNPromise('9780143127741').then(b => console.log('By ISBN:', b)).catch(e=>console.error(e.response?e.response.data:e.message));

  console.log('\n--- Task 12: searchByAuthorPromise ---');
  searchByAuthorPromise('Andy Weir').then(list => console.log('By Author:', list)).catch(e=>console.error(e.response?e.response.data:e.message));

  console.log('\n--- Task 13: searchByTitleAsync ---');
  try{
    const found = await searchByTitleAsync('Martian');
    console.log('By Title:', found);
  }catch(e){
    console.error(e.response?e.response.data:e.message);
  }
}

if(require.main === module) runDemo();
