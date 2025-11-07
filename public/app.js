const output = document.getElementById('output');
let token = null;
let username = null;

function show(o){ output.textContent = JSON.stringify(o, null, 2); }

document.getElementById('registerBtn').onclick = async ()=>{
  const u=document.getElementById('username').value;
  const p=document.getElementById('password').value;
  const res = await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:u,password:p})});
  show(await res.json());
};

document.getElementById('loginBtn').onclick = async ()=>{
  const u=document.getElementById('username').value;
  const p=document.getElementById('password').value;
  const res = await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:u,password:p})});
  const data = await res.json();
  if(data.token){ token = data.token; username = data.username; document.getElementById('authStatus').textContent = 'Logged in as '+username; }
  show(data);
};

document.getElementById('getAll').onclick = async ()=>{
  const res = await fetch('/api/books');
  show(await res.json());
};

document.getElementById('getByIsbn').onclick = async ()=>{
  const isbn = document.getElementById('isbnInput').value;
  const res = await fetch('/api/books/isbn/'+encodeURIComponent(isbn));
  show(await res.json());
};

document.getElementById('getByAuthor').onclick = async ()=>{
  const author = document.getElementById('authorInput').value;
  const res = await fetch('/api/books/author/'+encodeURIComponent(author));
  show(await res.json());
};

document.getElementById('getByTitle').onclick = async ()=>{
  const title = document.getElementById('titleInput').value;
  const res = await fetch('/api/books/title/'+encodeURIComponent(title));
  show(await res.json());
};

document.getElementById('getReviews').onclick = async ()=>{
  const isbn = document.getElementById('isbnReview').value;
  const res = await fetch('/api/books/'+encodeURIComponent(isbn)+'/reviews');
  show(await res.json());
};

document.getElementById('addReview').onclick = async ()=>{
  if(!token){ alert('Login first'); return; }
  const isbn = document.getElementById('revIsbn').value;
  const rating = Number(document.getElementById('revRating').value);
  const comment = document.getElementById('revComment').value;
  const res = await fetch('/api/books/'+encodeURIComponent(isbn)+'/reviews',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body:JSON.stringify({rating,comment})
  });
  show(await res.json());
};

document.getElementById('delReview').onclick = async ()=>{
  if(!token){ alert('Login first'); return; }
  const isbn = document.getElementById('revIsbn').value;
  const res = await fetch('/api/books/'+encodeURIComponent(isbn)+'/reviews',{
    method:'DELETE',
    headers:{'Authorization':'Bearer '+token}
  });
  show(await res.json());
};
