function safeUrl(value) {try {const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
export async function getArticles(username,{fetchImpl=fetch,timeoutMs=4000}={}) {
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try {
  const response=await fetchImpl(`https://dev.to/api/articles?username=${encodeURIComponent(username)}`,{signal:controller.signal,next:{revalidate:3600}});
  if(!response.ok)throw new Error('Provider unavailable');const data=await response.json();if(!Array.isArray(data))throw new Error('Invalid provider response');
  const articles=data.filter(a=>a&&typeof a.title==='string'&&a.title.trim()&&safeUrl(a.url)).map(a=>({id:a.id||a.url,title:a.title.trim(),url:safeUrl(a.url),description:typeof a.description==='string'?a.description:'',published_at:Number.isFinite(Date.parse(a.published_at))?a.published_at:null,reading_time_minutes:Number.isFinite(a.reading_time_minutes)?a.reading_time_minutes:null})).sort((a,b)=>(Date.parse(b.published_at)||0)-(Date.parse(a.published_at)||0));
  return {status:articles.length?'ready':'empty',articles};
 } catch {return {status:'unavailable',articles:[]};} finally {clearTimeout(timer);}
}
