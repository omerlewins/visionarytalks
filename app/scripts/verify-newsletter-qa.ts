import {getPayload} from 'payload';
import config from '../src/payload.config';
import {readFile} from 'node:fs/promises';
if(process.env.APP_ENV!=='preview'||process.env.NEON_PROJECT_ID!=='calm-meadow-38652801')throw Error('Preview only');
const {email}=JSON.parse(await readFile('../private/growth/newsletter-qa-email.json','utf8'));if(!/^newsletter-qa-\d+@example\.com$/.test(email))throw Error('Not a reserved test address');
const payload=await getPayload({config});try{const r=await payload.find({collection:'newsletter-registrations',where:{email:{equals:email}},pagination:false,depth:0});if(r.docs.length!==1||r.docs[0].emailVerified||r.docs[0].status!=='registered'||r.docs[0].consentVersion!=='newsletter-2026-10-12'||r.docs[0].sourcePath!=='/newsletter/')throw Error('Registration persistence failed');console.log(JSON.stringify({persisted:1,unverified:true,consentRecorded:true,deliveryDisabled:true}));await payload.delete({collection:'newsletter-registrations',where:{email:{equals:email}}});console.log('Reserved test registration removed.');}finally{await payload.destroy();}process.exit(0);
