const fs=require('fs'),cp=require('child_process'),path=require('path');
for(const f of fs.readdirSync(__dirname).filter(f=>f.endsWith('.test.js')).sort()){
 const r=cp.spawnSync(process.execPath,[path.join(__dirname,f)],{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);
}
