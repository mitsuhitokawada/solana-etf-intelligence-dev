import {panelHtml} from '../../lib/panel';
export async function GET(){return new Response(panelHtml,{headers:{'Content-Type':'text/html; charset=utf-8'}});}
