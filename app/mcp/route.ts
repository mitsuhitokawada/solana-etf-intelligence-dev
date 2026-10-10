import { getPrices } from '../../lib/prices';
import { panelHtml } from '../../lib/panel';
const uri='ui://etf-intelligence/market-panel-v7.html';
const tool={name:'get_market_prices',title:'Solana ETF Intelligence',description:'Open the Solana ETF Intelligence panel without fetching data. The user can request prices from inside the panel. Includes SOL prices, US Solana ETF flows and Solana DEX volume. Do not infer causation. Flag stale data.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:true},_meta:{ui:{resourceUri:uri},'openai/outputTemplate':uri,'openai/widgetAccessible':true,'openai/ui':{entrypoints:[{type:'thread'},{type:'global'}]}}};
export async function POST(request:Request){
 let message: {jsonrpc?:string;id?:string|number;method?:string;params?:{protocolVersion?:string;uri?:string;name?:string;arguments?:unknown}};
 try{message=await request.json() as typeof message;}catch{return Response.json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}},{status:400});}
 const id=message?.id??null;
 const respond=(result:unknown)=>Response.json({jsonrpc:'2.0',id,result});
 const error=(code:number,message:string)=>Response.json({jsonrpc:'2.0',id,error:{code,message}});
 if(!message || message.jsonrpc!=='2.0'||typeof message.method!=='string')return error(-32600,'Invalid Request');
 if(message.id===undefined&&message.method.startsWith('notifications/'))return new Response(null,{status:202});
 console.info('mcp_request',message.method,message.params?.name??'');
 switch(message.method){
 case 'initialize':return respond({protocolVersion:['2024-11-05','2025-03-26','2025-06-18','2025-11-25'].includes(message.params?.protocolVersion??'')?message.params?.protocolVersion:'2025-06-18',capabilities:{tools:{listChanged:false},resources:{listChanged:false}},serverInfo:{name:'solana-etf-intelligence',version:'0.1.0'},instructions:'SOL prices, US Solana ETF flows and Solana DEX volume. Includes direct mainnet RPC performance samples. Daily transaction counts and active addresses are not implemented. Always cite source and price update timestamp; do not fabricate data or infer causation.'});
 case 'ping':return respond({});
 case 'tools/list':return respond({tools:[tool,{...tool,name:'open_market_panel'},{name:'fetch_market_prices',title:'SOL価格・ETF・DEX取引高を取得',description:'Retrieve SOL prices and history, US Solana ETF flows, DEX volume, mainnet RPC performance and dated descriptive correlation. Explain the UTC window mismatch and never infer causation.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:true}}]});
 case 'resources/list':return respond({resources:[{uri,name:'market-panel',title:'ETF Intelligence Market Panel',mimeType:'text/html;profile=mcp-app'}]});
 case 'resources/templates/list':return respond({resourceTemplates:[]});
 case 'resources/read':if(![uri,'ui://etf-intelligence/market-panel.html'].includes(message.params?.uri??''))return error(-32602,'Unknown resource');return respond({contents:[{uri,mimeType:'text/html;profile=mcp-app',text:panelHtml,_meta:{ui:{prefersBorder:true,csp:{connectDomains:[],resourceDomains:[]}},'openai/ui':{availableDisplayModes:['inline','fullscreen']},'openai/widgetCSP':{connect_domains:[],resource_domains:[]},'openai/widgetDescription':'SOL prices, ETF flows and DEX volume. Includes SOL prices, US Solana ETF flows and Solana DEX volume.'}}]});
 case 'tools/call':{
   if(!request.headers.get('oai-authenticated-user-id'))return Response.json({error:'Authentication required'},{status:401});
   if(![tool.name,'open_market_panel','fetch_market_prices'].includes(message.params?.name??''))return error(-32602,'Unknown tool');
   if(message.params?.name!== 'fetch_market_prices')return respond({content:[{type:'text',text:'Market panel ready. Prices have not been fetched. Use the refresh button to retrieve real data. ETF and DEX volume can be fetched with the refresh button.'}],structuredContent:{status:'ready',prices:[],fetchedAt:new Date().toISOString(),dataMode:'unavailable'}});
   const args=message.params?.arguments??{};
   if(!args||typeof args!=='object'||Array.isArray(args)||Object.keys(args).length)return error(-32602,'No arguments expected');
   const d=await getPrices();return respond({content:[{type:'text',text:JSON.stringify(d)}],structuredContent:d,isError:d.status==='error'});
 }
 default:return error(-32601,'Method not found');
 }
}
export async function GET(){return new Response(null,{status:405,headers:{Allow:'POST'}});}
export async function DELETE(){return new Response(null,{status:405,headers:{Allow:'POST'}});}
