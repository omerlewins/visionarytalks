(function(root){
  function selectCompanies(companies, options={}) {
    const query=(options.query||'').trim().toLowerCase();
    return companies.filter(c=> (!options.vertical||options.vertical==='All'||c.vertical===options.vertical)&&(!options.metric||options.metric==='All'||c.observations[0].metric===options.metric)&&(!query||[c.name,c.description,c.vertical].join(' ').toLowerCase().includes(query))).slice().sort((a,b)=>{
      const x=a.observations[0],y=b.observations[0];
      if(options.sort==='name')return a.name.localeCompare(b.name);
      if(options.sort==='recent')return y.asOf.localeCompare(x.asOf)||a.name.localeCompare(b.name);
      const missingX=x.amountUSD==null,missingY=y.amountUSD==null;
      if(missingX!==missingY)return missingX?1:-1;
      return (options.sort==='asc'?x.amountUSD-y.amountUSD:y.amountUSD-x.amountUSD)||a.name.localeCompare(b.name);
    });
  }
  if(typeof module==='object'&&module.exports)module.exports={selectCompanies};
  else root.AITracker={selectCompanies};
})(typeof window==='object'?window:globalThis);
