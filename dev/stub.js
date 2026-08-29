/* Development only. Fakes the browser APIs so popup.html and options.html can
   be opened in an ordinary tab. Harmless if it ships; nothing loads it. */
let seq = 10; const nodes = new Map();
[['0',''],['1','Bookmarks bar'],['2','Other bookmarks']].forEach(([id,t],i)=>nodes.set(id,{id,parentId:i?'0':undefined,title:t,children:[]}));
nodes.get('0').children=['1','2'];
function mk(parentId,title,url,index){const id=String(++seq);nodes.set(id,{id,parentId,title,url,children:url?undefined:[]});
 const a=nodes.get(parentId).children;a.splice(index===undefined?a.length:index,0,id);return nodes.get(id);}
const root=mk('2','Pastemorphic');
const t1=mk(root.id,'Personal'), t2=mk(root.id,'Work'), t3=mk(root.id,'Code');
['Money','WWWWWWW','Address'].forEach(n=>mk(root.id,n));
const E=(b,s)=>'https://pastemorphic.invalid/#pm1:'+encodeURIComponent(JSON.stringify(s?{c:b,s}:{c:b})).replace(/['()!*~]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
mk(t1.id,'Email address',E('charlie@example.com',1));
mk(t1.id,'Home address',E('12 High Street\nSomewhere\nAB1 2CD',2));
mk(t1.id,'',E('The quick brown fox jumps over the lazy dog and keeps going well past the edge'));
mk(t1.id,'Phone',E('+44 7700 900123'));
mk(t2.id,'Sign off',E('Kind regards,\nCharlie'));
mk(t2.id,'Invoice line',E('Consultancy, one day'));
mk(t3.id,'Licence header',E('SPDX-License-Identifier: MIT',4));
const kids=id=>(nodes.get(id).children||[]).map(i=>({...nodes.get(i)}));
window.chrome={bookmarks:{
 getChildren:(id,cb)=>cb(kids(id)),
 get:(id,cb)=>cb(nodes.has(id)?[{...nodes.get(id)}]:[]),
 getTree:(cb)=>{const b=id=>{const n=nodes.get(id);return{id:n.id,parentId:n.parentId,title:n.title,url:n.url,children:n.children?n.children.map(b):undefined}};cb([b('0')])},
 create:(p,cb)=>cb&&cb({...mk(p.parentId,p.title,p.url,p.index)}),
 update:(id,p,cb)=>{Object.assign(nodes.get(id),p);cb&&cb({...nodes.get(id)})},
 move:(id,p,cb)=>{const n=nodes.get(id);const op=n.parentId;const f=nodes.get(op).children;const oi=f.indexOf(id);
  const np=p.parentId||op;let i=p.index;
  if(i!==undefined&&np===op&&i>oi)i-=1;            // Chromium counts the moving item
  f.splice(oi,1);n.parentId=np;const t=nodes.get(np).children;t.splice(i===undefined?t.length:i,0,id);cb&&cb({...n})},
 remove:(id,cb)=>{const n=nodes.get(id);const a=nodes.get(n.parentId).children;a.splice(a.indexOf(id),1);nodes.delete(id);cb&&cb()},
 removeTree:(id,cb)=>{const n=nodes.get(id);const a=nodes.get(n.parentId).children;a.splice(a.indexOf(id),1);cb&&cb()}},
 storage:{sync:{get:(d,cb)=>cb(Object.assign({},d,JSON.parse(localStorage.pmset||'{}'))),
   set:(p,cb)=>{localStorage.pmset=JSON.stringify(Object.assign(JSON.parse(localStorage.pmset||'{}'),p));cb&&cb()}},
  local:{get:(k,cb)=>cb({}),set:(p,cb)=>cb&&cb()},onChanged:{addListener(){}}},

 runtime:{sendMessage(){},openOptionsPage(){location.href='dev-options.html'},onMessage:{addListener(){}}},
 tabs:{create(o,cb){window.open(o.url);cb&&cb()}},
 commands:{getAll(cb){cb([{name:'slot1',shortcut:'Ctrl+Shift+1'},{name:'slot2',shortcut:'Ctrl+Shift+2'},{name:'slot3',shortcut:'Ctrl+Shift+3'},{name:'slot4',shortcut:''}])}}};
window.close=()=>console.log('(the popup would close here)');
