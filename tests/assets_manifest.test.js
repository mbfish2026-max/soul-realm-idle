'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/manifest.json'),'utf8'));
function dimensions(b){
 assert.strictEqual(b.toString('ascii',0,4),'RIFF');assert.strictEqual(b.toString('ascii',8,12),'WEBP');
 for(let p=12;p+8<=b.length;){const kind=b.toString('ascii',p,p+4),len=b.readUInt32LE(p+4),d=p+8;
 if(kind==='VP8X')return [1+b.readUIntLE(d+4,3),1+b.readUIntLE(d+7,3)];
 if(kind==='VP8 ')return [b.readUInt16LE(d+6)&16383,b.readUInt16LE(d+8)&16383];
 if(kind==='VP8L'){const x=b.readUInt32LE(d+1);return [(x&16383)+1,((x>>>14)&16383)+1];}
 p=d+len+(len%2);
 }throw Error('Missing image dimensions');
}
const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'assets/manifest.js'),'utf8'),context);
assert.strictEqual(JSON.stringify(context.SR.ASSETS),JSON.stringify(manifest));
const pattern=/^(hero_(idle|move|attack|skill|hit|win|die)|pet_fox_[a-z]+|(?:mob|boss|bg|icon_skill|icon_pet|ui)_[a-z][a-z0-9_]*|icon_ring_(white|yellow|purple|black|red))$/;
for(const [key,a] of Object.entries(manifest)){
 assert(pattern.test(key),'Invalid key '+key);assert.deepStrictEqual(Object.keys(a).sort(),['file','h','use','w']);
 assert(a.file.startsWith('assets/')&&!a.file.includes('..'));assert(Number.isInteger(a.w)&&a.w>0&&Number.isInteger(a.h)&&a.h>0);
 const b=fs.readFileSync(path.join(root,a.file));assert.deepStrictEqual(dimensions(b),[a.w,a.h],key);
 assert(b.length<=(key.startsWith('boss_')?600:300)*1024,key+' exceeds size budget');
 if(key.startsWith('bg_'))assert.deepStrictEqual([a.w,a.h],[780,1688]);
}
const keys=Object.keys(manifest),count=p=>keys.filter(k=>k.startsWith(p)).length;
assert(count('hero_')>=5);assert(count('pet_fox_')>=3);assert(count('mob_')>=3);assert(count('boss_')>=1);
assert(count('bg_')>=3);assert(count('icon_skill_')>=8);assert(count('icon_pet_')>=8);assert(count('ui_')>=3);
for(const c of ['white','yellow','purple','black','red'])assert(manifest['icon_ring_'+c]);
console.log('assets_manifest: '+keys.length+' assets passed');
