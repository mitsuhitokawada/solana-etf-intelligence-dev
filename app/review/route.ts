import {reviewHtml} from '../../lib/review';
export async function GET(){return new Response(reviewHtml,{headers:{'Content-Type':'text/html; charset=utf-8'}});}
