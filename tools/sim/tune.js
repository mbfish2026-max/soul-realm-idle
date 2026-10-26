/* Reproducible acceptance runner. Never edits game data or historical reports.
 * node tools/sim/tune.js --seeds=4200,4201 --hours=160 --assert-target=true
 * Other filters/options are forwarded to the continuous collection model.
 */
const cp=require('child_process'),path=require('path');
const args=process.argv.slice(2),seedArg=args.find(a=>a.startsWith('--seeds='));
const seeds=(seedArg?seedArg.slice(8):'4200,4201').split(',');
if(!seeds.length||seeds.some(s=>!/^\d+$/.test(s)))throw Error('invalid seeds');
let failed=false;
for(const seed of seeds){
 const forwarded=args.filter(a=>!a.startsWith('--seeds=')&&!a.startsWith('--seed='));
 const run=cp.spawnSync(process.execPath,[path.join(__dirname,'skills.js'),'--seed='+seed,...forwarded],{stdio:'inherit'});
 if(run.error)throw run.error;
 if(run.status!==0)failed=true;
}
if(failed)process.exitCode=1;
