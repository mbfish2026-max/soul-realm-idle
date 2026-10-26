/* Build deterministic manifests from generated, normalized artwork. */
const fs=require('fs'),path=require('path');
const {skills,classes,bosses}=require('./catalog');
const root=path.resolve(__dirname,'../..'),raw=path.join(__dirname,'raw');
const records=JSON.parse(fs.readFileSync(path.join(raw,'processed.json')));
const fxRecords=fs.existsSync(path.join(raw,'fx-processed.json'))?JSON.parse(fs.readFileSync(path.join(raw,'fx-processed.json'))):{};
function baseType(s){
  if(s.kind==='passive'||s.kind==='talent')return 'passive';
  if(s.kind==='ultimate'||s.kind==='bond')return 'ultimate';
  const types=(s.effects||[]).map(e=>e.type);
  return ['control','heal','shield','buff'].find(t=>types.includes(t))||'active';
}
function fxFamily(s){
  const effect=s.fxKey.split('_').slice(2).join('_');
  if(s.fxKey.startsWith('fusion_')||effect==='combo')return 'fx_fusion';
  if(['heal','shield','control','summon'].includes(effect))return 'fx_'+effect;
  if(effect==='buff')return 'fx_summon';
  if(['dot','debuff'].includes(effect)||s.kind==='ultimate')return 'fx_burst';
  return 'fx_slash_'+s.vein;
}
const manifest={};
for(const [key,r]of Object.entries(records))manifest['icon_skill_'+key]=Object.assign({},r,{artId:key});
const counts={skills:0,basicArt:Object.keys(records).filter(k=>k.startsWith('base_')).length,dedicatedArt:Object.keys(records).filter(k=>!k.startsWith('base_')).length,fxArt:Object.keys(fxRecords).length,iconMappings:0,fxMappings:0};
for(const s of Object.values(skills)){
  let preferred=s.id;
  if(!s.id.startsWith('fusion_')&&!bosses.includes(s.sourceKind))preferred=s.kind==='ultimate'&&s.classId?'ultimate_'+s.classId:null;
  const key=preferred&&records[preferred]?preferred:'base_'+s.vein+'_'+baseType(s);
  if(!records[key])throw Error('Missing generated icon '+key+' for '+s.id);
  manifest[s.iconKey]=Object.assign({},records[key],{artId:key,skillId:s.id,dedicated:!!(preferred&&records[preferred])});
  counts.iconMappings++;counts.skills++;
  const family=fxFamily(s);
  if(!fxRecords[family])throw Error('Missing generated FX '+family);
  // Shared fxKey must resolve consistently, regardless of ring level/kind.
  const stableFamily=s.fxKey.endsWith('_damage')?'fx_slash_'+s.vein:family;
  manifest[s.fxKey]=Object.assign({},fxRecords[stableFamily],{family:stableFamily});
}
Object.assign(manifest,fxRecords);
counts.fxMappings=new Set(Object.values(skills).map(s=>s.fxKey)).size;
const json=JSON.stringify(manifest,null,2)+'\n';
fs.writeFileSync(path.join(root,'assets/skills/manifest.json'),json);
// Keep browser JS compact and below 800 lines while matching JSON exactly.
const lines=Object.entries(manifest).map(([k,v])=>'  '+JSON.stringify(k)+':'+JSON.stringify(v));
fs.writeFileSync(path.join(root,'assets/skills/manifest.js'),"(function(g){'use strict';var S=g.SR=g.SR||{};S.ASSETS=S.ASSETS||{};Object.assign(S.ASSETS,{\n"+lines.join(',\n')+"\n});})(typeof window!=='undefined'?window:globalThis);\n");
fs.writeFileSync(path.join(raw,'counts.json'),JSON.stringify(counts,null,2)+'\n');
console.log(counts);
