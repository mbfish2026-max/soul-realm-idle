/* Read-only variant of the delivered checkpoint simulator: equip ordinary
 * same-level red gear. No production source or balance artifact is written. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '../..');
let source = fs.readFileSync(path.join(root, 'tools/sim/skills.js'), 'utf8');
source = source.replace('let b=SR.skills.init();', `for (const slot of SR.GEAR_DATA.slots) s.hero.bones[slot]={uid:'review-'+slot,type:'gear',slot,level,quality:4,stats:{atk:Math.round((2+level)*2.6),def:Math.round((1+level*.6)*2.6),hp:Math.round((15+level*6)*2.6)},affixes:[],setId:null};let b=SR.skills.init();`);
let rows;
const safeFs = Object.assign({}, fs, {writeFileSync(file, data) {
  if (file.endsWith('balance-skills.json')) rows=JSON.parse(data);
}});
const run = vm.runInThisContext('(function(require,__dirname,console){'+source+'\n})', {filename:'review-geared-simulator.js'});
run(id=>id==='fs'?safeFs:require(id),path.join(root,'tools/sim'),{log(){}});
console.log(JSON.stringify({build:'ten ordinary red pieces; no affixes/enhancement/set bonuses',min:Math.min(...rows.map(x=>x.hours)),max:Math.max(...rows.map(x=>x.hours)),within:rows.filter(x=>x.hours>=60&&x.hours<=80).length,count:rows.length}));
