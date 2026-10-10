export const assets = [{id:'solana',symbol:'SOL',name:'Solana'}] as const;
async function retrievePrices() {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true';
  const extras = Promise.all([getETF(), getOnchain(), getPriceHistory(), getRPC()]);
  const key = process.env.COINGECKO_DEMO_API_KEY;
  try {
    const res = await fetch(url, {headers:key?{'x-cg-demo-api-key':key}:{},signal:AbortSignal.timeout(10000)});
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
    const raw = await res.json() as Record<string, {usd:unknown;usd_24h_change:unknown;last_updated_at:unknown}>;
    const fetchedAt = new Date().toISOString();
    const [etf,onchain,priceHistory,rpc] = await extras;
    const prices = assets.map(a=>{
      const d=raw[a.id];
      if (!d || typeof d.usd !== 'number' || !Number.isFinite(d.usd) || d.usd<=0 || typeof d.last_updated_at !== 'number' || !Number.isFinite(d.last_updated_at)) throw new Error('Invalid price response');
      return {...a,usd:d.usd,change24h:typeof d.usd_24h_change==='number'&&Number.isFinite(d.usd_24h_change)?d.usd_24h_change:null,updatedAt:new Date(d.last_updated_at*1000).toISOString(),stale:Date.now()-d.last_updated_at*1000>15*60*1000};
    });
    return {status:'ok' as const,source:'CoinGecko',sourceUrl:'https://www.coingecko.com/',fetchedAt,currency:'USD',dataMode:'real',prices,rpc,priceHistory,etf,etfStatus:etf.status,onchain,onchainStatus:onchain.status,note:'Price changes alone do not establish ETF flows or causation.'};
  } catch(e) {
    const [etf,onchain,priceHistory,rpc] = await extras;
    return {status:'error' as const,source:'CoinGecko',fetchedAt:new Date().toISOString(),dataMode:'unavailable',prices:[],rpc,priceHistory,error:e instanceof Error?e.message:'Price retrieval failed',etf,etfStatus:etf.status,onchain,onchainStatus:onchain.status};
  }
}

async function getETF(){
 const fetchedAt=new Date().toISOString();
 try{
  const key=process.env.SOSOVALUE_API_KEY?.trim();
  if(!key)throw new Error('SoSoValue APIキー未設定');
  const r=await fetch('https://openapi.sosovalue.com/openapi/v1/etfs/summary-history?symbol=SOL&country_code=US&limit=30',{headers:{'x-soso-api-key':key},signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw new Error('SoSoValue HTTP '+r.status);
  const body=await r.json() as any;
  if(Number(body.code)!==0)throw new Error('SoSoValue応答コード '+String(body.code));
  if(!Array.isArray(body.data)||!body.data.length)throw new Error('Solana ETFデータなし');
  const rows=body.data.map((x:any)=>{const number=(v:any)=>{if(v===null||v===undefined||v==='')return null;const n=Number(v);return Number.isFinite(n)?n:null;};if(!/^\d{4}-\d{2}-\d{2}$/.test(x.date))throw new Error('ETF日付が不正');return {date:x.date,netInflow:number(x.total_net_inflow),netAssets:number(x.total_net_assets),volume:number(x.total_value_traded),cumulativeInflow:number(x.cum_net_inflow)};}).sort((a:any,b:any)=>b.date.localeCompare(a.date));
  return {status:'ok',source:'SoSoValue',fetchedAt,latest:rows[0],history:rows};
 }catch(e){return {status:'error',source:'SoSoValue',fetchedAt,error:e instanceof Error?e.message:'ETF取得失敗'};}
}

async function getOnchain(){
 const fetchedAt=new Date().toISOString();
 const sourceUrl='https://defillama.com/chain/solana';
 try{
  const r=await fetch('https://api.llama.fi/overview/dexs/Solana?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true',{signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw new Error('DefiLlama HTTP '+r.status);
  const d=await r.json() as Record<string,unknown>;
  if(d.chain!=='Solana')throw new Error('対象チェーンが不正');
  const volume=(k:string)=>{const v=d[k];if(typeof v!=='number'||!Number.isFinite(v)||v<0)throw new Error('DEX取引高が不正');return v;};
  return {status:'ok',source:'DefiLlama',sourceUrl,fetchedAt,chain:'Solana',currency:'USD',volume24h:volume('total24h'),volume7d:volume('total7d'),volume30d:volume('total30d'),change24h:typeof d.change_1d==='number'&&Number.isFinite(d.change_1d)?d.change_1d:null,definition:'DefiLlamaが集計するSolana上のDEX取引高。SOL単体の売買高ではなく、対象DEXの全トークン取引。期間はAPIの24時間・7日・30日集計。取得時刻は集計更新時刻とは異なる。',activeAddressesStatus:'not_implemented',transactionsStatus:'not_implemented'};
 }catch(e){return {status:'error',source:'DefiLlama',sourceUrl,fetchedAt,error:e instanceof Error?e.message:'オンチェーン取得失敗'};}
}

async function getPriceHistory(){
 const fetchedAt=new Date().toISOString();
 try{
  const key=process.env.COINGECKO_DEMO_API_KEY?.trim();
  if(!key)throw new Error('CoinGecko APIキー未設定');
  const r=await fetch('https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=90&interval=daily',{headers:{'x-cg-demo-api-key':key},signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw new Error('CoinGecko価格履歴 HTTP '+r.status);
  const d=await r.json() as {prices?:unknown};
  if(!Array.isArray(d.prices)||d.prices.length<2)throw new Error('価格履歴なし');
  const points=d.prices.map((p:unknown)=>{if(!Array.isArray(p)||typeof p[0]!=='number'||typeof p[1]!=='number'||!Number.isFinite(p[0])||!Number.isFinite(p[1])||p[0]<=0||p[1]<=0||p[0]>Date.now()+300000)throw new Error('価格履歴が不正');return {timestamp:p[0],usd:p[1]};}).sort((a,b)=>a.timestamp-b.timestamp);
  return {status:'ok',source:'CoinGecko',fetchedAt,currency:'USD',interval:'daily',points};
 }catch(e){return {status:'error',source:'CoinGecko',fetchedAt,error:e instanceof Error?e.message:'価格履歴取得失敗'};}
}

// Shared public-market data only. Cache is isolate-local, never user-owned data.
type MarketResult = Awaited<ReturnType<typeof retrievePrices>> & {relationship: ReturnType<typeof analyzeRelationship>};
let cached: {value: MarketResult; expires: number}|undefined;
let inFlight: Promise<MarketResult>|undefined;
export async function getPrices(){
 if(cached&&cached.expires>Date.now())return {...cached.value,cached:true};
 if(!inFlight)inFlight=retrievePrices().then(value=>{const healthy=value.status==='ok'&&value.etf.status==='ok'&&value.onchain.status==='ok'&&value.priceHistory.status==='ok'&&value.rpc.status==='ok';const result={...value,relationship:analyzeRelationship(value.etf,value.priceHistory)};cached={value:result,expires:Date.now()+(healthy?300000:15000)};return result;}).finally(()=>{inFlight=undefined;});
 return {...await inFlight,cached:false};
}

export function analyzeRelationship(etf: any, history: any){
 const basis='ETF取引日Dの純資金フローと、Dの00:00 UTCからD+1の00:00 UTCまでのSOL価格変化率を比較。米国ETFの取引終了時刻とは一致しません。';
 if(etf?.status!=='ok'||history?.status!=='ok')return {status:'unavailable',basis,reason:'ETFまたは価格履歴を取得できていません。'};
 const daily=new Map<string,number>();
 for(const p of history.points){const d=new Date(p.timestamp);if(d.getUTCHours()===0&&d.getUTCMinutes()===0)daily.set(d.toISOString().slice(0,10),p.usd);}
 const next=(date:string,days:number)=>new Date(Date.parse(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
 const pairs: {date:string;flow:number;returnPct:number}[]=[];
 for(const r of etf.history){const a=daily.get(r.date),b=daily.get(next(r.date,1));if(typeof r.netInflow==='number'&&Number.isFinite(r.netInflow)&&a&&b)pairs.push({date:r.date,flow:r.netInflow,returnPct:(b/a-1)*100});}
 pairs.sort((a,b)=>a.date.localeCompare(b.date));
 if(pairs.length<10)return {status:'insufficient',basis,n:pairs.length,reason:'共通日付の有効データが10件未満のため相関の表示を保留します。'};
 const mx=pairs.reduce((s,p)=>s+p.flow,0)/pairs.length,my=pairs.reduce((s,p)=>s+p.returnPct,0)/pairs.length;
 let xy=0,xx=0,yy=0;for(const p of pairs){const x=p.flow-mx,y=p.returnPct-my;xy+=x*y;xx+=x*x;yy+=y*y;}
 if(xx===0||yy===0)return {status:'insufficient',basis,n:pairs.length,reason:'値の変動がなく相関を計算できません。'};
 return {status:'ok',basis,n:pairs.length,start:pairs[0].date,end:pairs[pairs.length-1].date,pearson:Math.max(-1,Math.min(1,xy/Math.sqrt(xx*yy))),pairs,caution:'短い観測期間の記述的な相関です。統計的有意性は未検証。資金流入が価格上昇の原因であるとは示しません。'};
}

async function getRPC(){
 const sourceUrl='https://solana-rpc.publicnode.com';
 try{
  const r=await fetch(sourceUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify([{jsonrpc:'2.0',id:1,method:'getGenesisHash'},{jsonrpc:'2.0',id:2,method:'getRecentPerformanceSamples',params:[1]}]),signal:AbortSignal.timeout(10000)});
  if(!r.ok)throw new Error('Solana RPC HTTP '+r.status);
  const results=await r.json() as any;
  if(!Array.isArray(results)||results.find((x:any)=>x.id===1)?.result!=='5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d')throw new Error('RPC network is not verified Solana mainnet');
  const body=results.find((x:any)=>x.id===2);const d=body?.result?.[0];
  const valid=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
  if(body.error||!d||!valid(d.slot)||!valid(d.numTransactions)||!valid(d.samplePeriodSecs)||d.samplePeriodSecs===0)throw new Error('Invalid Solana performance sample');
  const nonVote=valid(d.numNonVoteTransactions)&&d.numNonVoteTransactions<=d.numTransactions?d.numNonVoteTransactions:null;
  return {status:'ok',source:'Solana Mainnet RPC (PublicNode)',sourceUrl,fetchedAt:new Date().toISOString(),slot:d.slot,samplePeriodSecs:d.samplePeriodSecs,transactions:d.numTransactions,nonVoteTransactions:nonVote,tps:d.numTransactions/d.samplePeriodSecs,nonVoteTps:nonVote===null?null:nonVote/d.samplePeriodSecs,definition:'Recent RPC performance sample only, not daily transactions or unique users. Total TPS includes voting transactions.'};
 }catch(e){return {status:'error',source:'Solana Mainnet RPC (PublicNode)',sourceUrl,fetchedAt:new Date().toISOString(),error:e instanceof Error?e.message:'Solana RPC retrieval failed'};}
}
