const fs=require('fs'), path=require('path');
const postcss=require(process.env.LV_BUILD_MODULES+'/postcss');
const selectors=require(process.env.LV_BUILD_MODULES+'/postcss-selector-parser');
const root=path.resolve(__dirname,'..');
let output='';
for(const [id,css] of Object.entries(JSON.parse(fs.readFileSync(root+'/tools/styles.json','utf8')))){
 const ast=postcss.parse(css);
 ast.walkAtRules('import',r=>r.remove());
 ast.walkRules(rule=>{
  let p=rule.parent;while(p){if(p.type==='atrule'&&/keyframes$/i.test(p.name))return;p=p.parent;}
  rule.selector=selectors(list=>{list.each(sel=>{
   let rooted=false;
   sel.walk(node=>{
    if((node.type==='tag'&&['html','body'].includes(node.value))||(node.type==='pseudo'&&node.value===':root')){
     if(!rooted){node.replaceWith(selectors.id({value:id}));rooted=true;}else node.remove();
    }
   });
   if(!rooted){sel.prepend(selectors.combinator({value:' '}));sel.prepend(selectors.id({value:id}));}
  });}).processSync(rule.selector);
 });
 output+=ast.toString()+'\n';
}
fs.writeFileSync(root+'/assets/css/blocks.css',output);
