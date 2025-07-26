import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  getDatabase, ref, push, onValue, update
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
import {
  getMessaging, getToken, onMessage
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js';

const config = {/* 在此放你的 firebaseConfig */};
const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getDatabase(app);
const messaging = getMessaging(app);

onAuthStateChanged(auth,user=>{
  if(user) {
    update(ref(db,`users/${user.uid}`),{email:user.email});
    if(document.getElementById("main")) document.getElementById("main").style.display='block';
    startFeed();
    onMessage(messaging,payload=>alert(`通知：${payload.notification.title}`));
  }
});
window.register=()=>createUserWithEmailAndPassword(auth,
  document.getElementById("email").value,
  document.getElementById("password").value
).catch(alert);
window.login=()=>signInWithEmailAndPassword(auth,
  document.getElementById("email").value,
  document.getElementById("password").value
).catch(alert);
window.requestNotification=async()=>{
  const perm=await Notification.requestPermission();
  if(perm==='granted'){
    const token=await getToken(messaging,{vapidKey:'YOUR_VAPID_KEY'});
    update(ref(db,`users/${auth.currentUser.uid}`),{fcmToken:token});
    alert('通知をオンにしました');
  }
};
window.submitPost=()=>{
  const txt=document.getElementById("postInput").value;
  const img=document.getElementById("imgUrl").value;
  push(ref(db,'posts'),{author:auth.currentUser.uid,content:txt,imgUrl:img||'',time:Date.now()});
};
function startFeed(){
  onValue(ref(db,'posts'),snap=>{
    const box=document.getElementById("posts");
    box.innerHTML="";
    Object.entries(snap.val()||{}).sort((a,b)=>b[1].time - a[1].time).forEach(([pid,p])=>{
      const el=document.createElement("div"); el.className='post';
      let html=`<p><b>${p.author}</b>: ${p.content}</p>`;
      if(p.imgUrl) html+=`<img src="${p.imgUrl}"><br>`;
      const likeCount = p.likes?Object.keys(p.likes).length:0;
      html+=`<button onclick="like('${pid}')">👍${likeCount}</button>`;
      html+=`<button onclick="showComments('${pid}')">コメント</button><div id="cmt-${pid}"></div>`;
      el.innerHTML=html; box.appendChild(el);
    });
  });
}
window.like=pid=>update(ref(db,`posts/${pid}/likes/${auth.currentUser.uid}`),true);
window.showComments=pid=>{
  const cont=document.getElementById(`cmt-${pid}`); cont.innerHTML='';
  onValue(ref(db,`posts/${pid}/comments`),snap=>{
    Object.values(snap.val()||{}).forEach(c=>cont.innerHTML+=`<p><i>${c.uid}</i>: ${c.text}</p>`);
    const inp=document.createElement("input"), btn=document.createElement("button");
    inp.placeholder='コメントを書く'; btn.textContent='送信';
    btn.onclick=()=>{ push(ref(db,`posts/${pid}/comments`),{uid:auth.currentUser.uid,text:inp.value,time:Date.now()}); inp.value=''; };
    cont.appendChild(inp); cont.appendChild(btn);
  });
};
