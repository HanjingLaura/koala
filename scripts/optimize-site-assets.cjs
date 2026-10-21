/* Encoding/resizing only. Original approved PNGs are kept as sources. Requires sharp. */
const sharp=require('sharp'),fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const base=path.resolve(__dirname,'../website/assets'),out=path.join(base,'web');await fs.mkdir(out,{recursive:true});
 const stems=['kora-cheer-wink-v4','kora-food-still-v1','kora-fitness-still-v1'];
 for(const id of ['calm','snark','fiery','gentle'])stems.push(`kora-${id}-sport-${['snark','fiery'].includes(id)?'v4':'v2'}`,`kora-${id}-blink`);
 for(const id of ['lazy','spark','busy','feel','steady','guide'])stems.push(`kora-life-${id}-v6`,`kora-life-${id}-blink`);
 const manifest={};
 for(const stem of stems){
  const src=path.join(base,stem+'.png');
  for(const width of [384,768]){
   const name=stem+(width===384?'-small':'')+'.webp';
   await sharp(src).resize(width,width,{fit:'inside',withoutEnlargement:true}).webp({quality:86,alphaQuality:100,effort:6}).toFile(path.join(out,name));
   manifest[name]={bytes:(await fs.stat(path.join(out,name))).size,source:stem+'.png',width};
  }
 }
 await fs.writeFile(path.join(out,'encoding-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({files:Object.keys(manifest).length,totalBytes:Object.values(manifest).reduce((n,x)=>n+x.bytes,0)}));
})();
