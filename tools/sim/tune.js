/* Only raises underperforming build attack. Preserves the strongest build. */
const fs=require('fs'),cp=require('child_process'),path=require('path'),root=path.resolve(__dirname,'../..');
for(let pass=0;pass<8;pass++){
 const run=cp.spawnSync(process.execPath,[path.join(__dirname,'skills.js')],{cwd:root,encoding:'utf8'});if(run.status)throw Error(run.stderr);
 const rows=JSON.parse(fs.readFileSync(path.join(root,'docs/balance-skills.json'))),file=path.join(root,'data/skill-progression.js');let source=fs.readFileSync(file,'utf8'),match=source.match(/S.DATA.skillBalance=(.*?);S.progression/),table=JSON.parse(match[1]);
 console.log('pass',pass,'range',Math.min(...rows.map(r=>r.hours)),Math.max(...rows.map(r=>r.hours)));
 if(rows.every(r=>r.hours>=60&&r.hours<=80))break;
 for(const r of rows)if(r.hours>79){const key=r.classId+':'+r.option+':'+r.role;table[key]=+(Math.min(30,(table[key]||1)*Math.pow(r.hours/73,1.25))).toFixed(4);}
 source=source.replace(/S.DATA.skillBalance=.*?;S.progression/,'S.DATA.skillBalance='+JSON.stringify(table)+';S.progression');fs.writeFileSync(file,source);
}
cp.execFileSync(process.execPath,[path.join(__dirname,'skills.js')],{cwd:root,stdio:'inherit'});
