'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..');
const {skills,bosses,classes}=require('../tools/n/catalog');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/skills/manifest.json')));
const context={SR:{ASSETS:{retained:{file:'existing.webp'}}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/skills/manifest.js'),'utf8'),context);
assert.equal(context.SR.ASSETS.retained.file,'existing.webp');
for(const [key,value]of Object.entries(manifest))assert.deepStrictEqual(JSON.parse(JSON.stringify(context.SR.ASSETS[key])),value,key+' JS/JSON mismatch');
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/skills/manifest.js'),'utf8'),context);
for(const s of Object.values(skills)){
  assert(s.iconKey&&manifest[s.iconKey],s.id+' missing icon');
  assert(s.fxKey&&manifest[s.fxKey],s.id+' missing FX');
  const icon=manifest[s.iconKey],fx=manifest[s.fxKey];
  assert.equal(icon.w,128);assert.equal(icon.h,128);assert.equal(icon.scale,2);
  assert.equal(icon.skillId,s.id);
  assert(fx.frames>1&&fx.fw>0&&fx.fh>0&&fx.fps>0,s.id+' invalid animation');
  assert.equal(fx.loop,false);assert(fx.frames/fx.fps>=.7&&fx.frames/fx.fps<=1.2);
  if(icon.dedicated&&(s.id.startsWith('fusion_')||bosses.includes(s.sourceKind)))assert.equal(icon.artId,s.id,s.id+' dedicated art mismatch');
}
for(const c of classes)assert(manifest['icon_skill_ultimate_'+c.id],c.id+' missing ultimate art');
const files=new Map();
for(const entry of Object.values(manifest)){
  assert(entry.file.startsWith('assets/skills/')&&!entry.file.includes('..'));
  files.set(entry.file,{w:entry.w,h:entry.h,max:entry.frames?1000000:300000,alpha:true,frames:entry.frames||0,margin:entry.frames?0:10});
  if(entry.frames){assert.equal(entry.w,entry.fw*entry.frames);assert.equal(entry.h,entry.fh);}
  if(entry.atlas){const a=entry.atlas;assert(a.x>=0&&a.y>=0);files.set(a.file,{max:1000000,atlas:true});}
}
function webpInfo(b){
 assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');
 let w,h,alpha=false;
 for(let p=12;p+8<=b.length;){
  const kind=b.toString('ascii',p,p+4),length=b.readUInt32LE(p+4),d=p+8;
  assert(d+length<=b.length,'truncated WebP');
  if(kind==='VP8X'){w=1+b.readUIntLE(d+4,3);h=1+b.readUIntLE(d+7,3);alpha=!!(b[d]&16);}
  if(kind==='ALPH')alpha=true;
  if(kind==='VP8 '&&!w){w=b.readUInt16LE(d+6)&16383;h=b.readUInt16LE(d+8)&16383;}
  if(kind==='VP8L'){const x=b.readUInt32LE(d+1);if(!w){w=(x&16383)+1;h=((x>>>14)&16383)+1;}alpha=alpha||!!((x>>>28)&1);}
  p=d+length+(length%2);
 }
 assert(w&&h,'missing WebP dimensions');return {w,h,alpha};
}
const sizes=new Map();
for(const [file,spec]of files){
 const bytes=fs.readFileSync(path.join(root,file));
 assert(bytes.length<=spec.max,file+' exceeds size limit');
 const info=webpInfo(bytes);sizes.set(file,info);
 if(spec.w){assert.equal(info.w,spec.w,file);assert.equal(info.h,spec.h,file);}
 if(spec.alpha)assert(info.alpha,file+' has no alpha channel');
 if(spec.atlas)assert(info.w===1024&&info.h>0&&info.h<=1024&&info.h%128===0,file+' invalid atlas size');
}
for(const entry of Object.values(manifest))if(entry.atlas){
 const a=entry.atlas;
 assert.equal(a.w,128);assert.equal(a.h,128);
 const size=sizes.get(a.file);assert(a.x+128<=size.w&&a.y+128<=size.h,'atlas rect overflow');
}
console.log('assets_skills: '+Object.keys(skills).length+' skills resolve; JS merge, dedicated art, dimensions, alpha, atlas and size passed');
