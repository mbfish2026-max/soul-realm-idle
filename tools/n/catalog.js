/* Read-only data snapshot for skill art tooling. */
const path=require('path');
const root=path.resolve(__dirname,'../..');
['names','data/souls','data/skills','data/pets','data/maps','data/realms','data/ext/progression','data/ext/pets','data/ext/maps','data/ext/install'].forEach(f=>require(path.join(root,f)));
SR.content.install();
require(path.join(root,'data/skill-tree'));
require(path.join(root,'data/ring-skills'));
const bosses=new Set();
SR.DATA.maps.forEach(m=>[m].concat(m.floorTables||[]).forEach(t=>{if(t.boss)bosses.add(t.boss.kind);}));
SR.DATA.realms.forEach(r=>{if(r.trial&&r.trial.boss)bosses.add(r.trial.boss.kind);});
module.exports={skills:SR.DATA.skills,classes:SR.DATA.classes,bosses:[...bosses]};
if(require.main===module)console.log(JSON.stringify(module.exports));
