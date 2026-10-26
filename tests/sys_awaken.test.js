const assert=require('assert');
const fs=require('fs'),vm=require('vm');
global.SR={rng:()=>0,bus:{on(){},emit(){}},save:{markDirty(){},state:{hero:{soulId:'blade',level:20,talent:7,rings:[],exp:20},flags:{awakened:true},bag:[],store:[],bagCap:60,pets:[],team:{pets:[]},cur:{petSoul:9999}}}};
['names.js','data/souls.js','data/skills.js','data/pets.js','data/realms.js','systems/awaken.js','systems/rings.js','systems/pets.js','systems/stats.js'].forEach(f=>vm.runInThisContext(fs.readFileSync(require('path').join(__dirname,'..',f),'utf8')));
const s=SR.save.state;
s.flags.awakened=false;assert.equal(new Set(SR.awaken.choices().map(x=>x.id)).size,3);assert(!SR.awaken.choose('bad'));assert(SR.awaken.choose('tiger'));assert(s.hero.twin);assert(s.hero.talent>=1&&s.hero.talent<=10);assert(!SR.awaken.choose('body'));
console.log('sys_awaken passed');
