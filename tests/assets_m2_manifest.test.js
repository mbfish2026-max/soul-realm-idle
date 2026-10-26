'use strict';
var assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
var root=path.resolve(__dirname,'..');
var manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/m2/manifest.json'),'utf8'));
var prompts=JSON.parse(fs.readFileSync(path.join(root,'tools/art2/prompts.json'),'utf8'));
var provenance=JSON.parse(fs.readFileSync(path.join(root,'tools/art2/provenance.json'),'utf8'));
var crypto=require('crypto');
assert.strictEqual(prompts.length,69);
assert.deepStrictEqual(Object.keys(manifest).sort(),prompts.map(function(x){return x.key;}).sort());
assert.strictEqual(provenance.length,69);
function webpSize(buffer){
  assert.strictEqual(buffer.toString('ascii',0,4),'RIFF');
  assert.strictEqual(buffer.toString('ascii',8,12),'WEBP');
  for(var offset=12;offset+8<=buffer.length;){
    var type=buffer.toString('ascii',offset,offset+4),length=buffer.readUInt32LE(offset+4),p=offset+8;
    if(type==='VP8X')return [1+buffer.readUIntLE(p+4,3),1+buffer.readUIntLE(p+7,3)];
    if(type==='VP8 ')return [buffer.readUInt16LE(p+6)&16383,buffer.readUInt16LE(p+8)&16383];
    if(type==='VP8L'){var bits=buffer.readUInt32LE(p+1);return [(bits&16383)+1,((bits>>>14)&16383)+1];}
    offset=p+length+(length%2);
  }
  throw new Error('Missing image dimensions');
}
var count={};
Object.keys(manifest).forEach(function(key){
  var asset=manifest[key],file=path.resolve(root,asset.file);
  assert(file.startsWith(path.join(root,'assets/m2')+path.sep));
  assert(/^assets\/m2\/[a-z_]+\.webp$/.test(asset.file));
  var bytes=fs.readFileSync(file);
  assert(bytes.length<=(asset.use==='boss'?600:300)*1024,key+' size');
  assert.deepStrictEqual(webpSize(bytes),[asset.w,asset.h],key+' dimensions');
  if(asset.use==='background')assert.deepStrictEqual([asset.w,asset.h],[780,1688]);
  else {
    assert.strictEqual(bytes.toString('ascii',12,16),'VP8X',key+' alpha container');
    assert(bytes[20]&16,key+' transparency');
  }
  var source=provenance.find(function(x){return x.key===key;});
  assert(source&&source.generator==='image_gen');
  assert.strictEqual(crypto.createHash('sha256').update(bytes).digest('hex'),source.outputSha256,key+' hash');
  count[asset.use]=(count[asset.use]||0)+1;
});
assert.deepStrictEqual(count,{mob:8,boss:2,pet:10,portrait:10,icon:37,background:2});
var sentinel={file:'existing.webp'},context={SR:{ASSETS:{existing:sentinel}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'assets/m2/manifest.js'),'utf8'),context);
assert.strictEqual(context.SR.ASSETS.existing,sentinel);
assert.strictEqual(typeof context.SR.art2.install,'function');
Object.keys(manifest).forEach(function(key){assert.deepStrictEqual(JSON.parse(JSON.stringify(context.SR.ASSETS[key])),manifest[key]);});
var installed=context.SR.ASSETS;
assert.strictEqual(context.SR.art2.install(),installed);
assert.strictEqual(Object.keys(installed).length,70);
context.SR.ASSETS={later:sentinel};
context.SR.art2.install();
assert.strictEqual(context.SR.ASSETS.later,sentinel);
assert.strictEqual(Object.keys(context.SR.ASSETS).length,70);
console.log('assets_m2_manifest: 69 images, dimensions, budgets, alpha, provenance and installation passed');
