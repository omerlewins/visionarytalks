const fs = require('fs');
module.exports = async function protectPreview(page, base) {
  if (!base || !base.includes('.vercel.app')) return;
  if (!/^https:\/\/visionarytalks-[a-z0-9]+-omer-webielcoms-projects\.vercel\.app$/.test(base)) throw Error('Unexpected Preview origin');
  const access = JSON.parse(fs.readFileSync('private/preview-access.json','utf8'));
  await page.route(base+'/**',route=>route.continue({headers:{...route.request().headers(),'x-vercel-protection-bypass':access.bypass}}));
};
