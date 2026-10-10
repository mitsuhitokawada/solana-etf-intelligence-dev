import ts from 'typescript';
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=ts.transpileModule(fs.readFileSync('lib/prices.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
async function scenario(mode){let calls=0;const now=Date.now();const context={exports:{},process:{env:{COINGECKO_DEMO_API_KEY:'test',SOSOVALUE_API_KEY:'test'}},Date,AbortSignal,fetch:async url=>{calls++;if(url.includes('simple/price'))return {ok:mode!=='price403',status:403,json:async()=>({solana:{usd:mode==='badPrice'?NaN:100,usd_24h_change:1,last_updated_at:now/1000}})};if(url.includes('market_chart'))return {ok:true,json:async()=>({prices:[[now-86400000,99],[now,100]]})};if(url.includes('summary-history'))return {ok:true,json:async()=>({code:0,data:[{date:'2026-10-09',total_net_inflow:null,total_net_assets:'1000'}]})};if(url.includes('publicnode'))return {ok:true,json:async()=>[{id:1,result:'5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d'},{id:2,result:[{slot:100,samplePeriodSecs:60,numTransactions:600,numNonVoteTransactions:120}]}]};return {ok:true,json:async()=>({chain:'Solana',total24h:mode==='badDex'?-1:100,total7d:700,total30d:3000,change_1d:0})};}};vm.createContext(context);vm.runInContext(code,context);const d=await context.exports.getPrices();return {d,context,calls:()=>calls};}
const good=await scenario('ok');assert.equal(good.d.status,'ok');assert.equal(good.d.rpc.nonVoteTps,2);assert.equal(good.d.etf.latest.netInflow,null);assert.equal(good.d.priceHistory.points.length,2);await good.context.exports.getPrices();assert.equal(good.calls(),5,'cached request must not repeat provider calls');
for(const mode of ['price403','badPrice']){const {d}=await scenario(mode);assert.equal(d.status,'error');assert.equal(d.prices.length,0);assert.equal(d.etf.status,'ok');assert.equal(d.onchain.status,'ok');}
const {d}=await scenario('badDex');assert.equal(d.onchain.status,'error');assert.equal(d.status,'ok');
console.log('PASS: data validation, missing ETF value, independent failures, history, cache');

const analyze=good.context.exports.analyzeRelationship;
const rows=[],points=[];let price=100;for(let i=0;i<13;i++){const t=Date.UTC(2026,8,1+i);points.push({timestamp:t,usd:price});if(i<12)rows.push({date:new Date(t).toISOString().slice(0,10),netInflow:i});price*=1+i/100;}
const rel=analyze({status:'ok',history:rows},{status:'ok',points});assert.equal(rel.status,'ok');assert.ok(Math.abs(rel.pearson-1)<1e-9);assert.equal(rel.n,12);assert.equal(analyze({status:'ok',history:rows.slice(0,3)},{status:'ok',points}).status,'insufficient');console.log('PASS: date alignment, Pearson correlation, small-sample guard');
