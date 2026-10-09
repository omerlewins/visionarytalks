import { getPayload, createLocalReq } from 'payload';
import config from '../src/payload.config';
import { getStorageFilePath } from '@payloadcms/plugin-cloud-storage/utilities';
import { put } from '@vercel/blob';
import { readFile, writeFile } from 'node:fs/promises';
import { localMediaFile } from '../src/migration/media';
import { readBlobDocument } from '../src/cms/blob-storage';
import { checksum } from '../src/migration/wordpress';
import manifest from '../src/data/legacy-media.json';
if(process.env.APP_ENV!=='preview'||process.env.VERCEL_ENV==='production'||!process.env.BLOB_READ_WRITE_TOKEN)throw new Error('Isolated Blob preview only');
const payload=await getPayload({config});const req=await createLocalReq({},payload);let restored=0;
for(const [path,hash] of Object.entries(manifest)){
 const original=await readFile(await localMediaFile('../private/uploads-2026-10-08/uploads','https://visionarytalks.com'+path));
 if(checksum(original.toString('base64'))!==hash)throw new Error('Source checksum mismatch');
 const doc=(await payload.find({collection:'media',where:{checksum:{equals:hash}},limit:1})).docs[0];
 if(!doc?.approved)throw new Error('Only approved original assets are eligible');
 const stored=await readBlobDocument(req,'media',doc);
 if(!stored.equals(original)){
  await writeFile(`../private/ranking-audit/media-before-${doc.id}`,stored);
  const key=await getStorageFilePath({collection:payload.collections.media.config,collectionPrefix:'media',doc,filename:doc.filename,req,useCompositePrefixes:true});
  await put(key,original,{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:doc.mimeType});
  await payload.update({collection:'media',id:doc.id,data:{filesize:original.length}});
  if(!(await readBlobDocument(req,'media',doc)).equals(original))throw new Error('Original restoration failed');
  restored++;
 }
}
console.log(JSON.stringify({checked:Object.keys(manifest).length,restored}));await payload.destroy();process.exit(0);
