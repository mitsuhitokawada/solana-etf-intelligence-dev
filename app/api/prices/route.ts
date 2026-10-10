import {getPrices} from '../../../lib/prices';
// Owner-private Site: dispatch validates visitor or OAI-Sites-Authorization.
// This endpoint reads shared market data and no user-owned records.
export async function GET(){
 return Response.json(await getPrices(),{headers:{'Cache-Control':'private, max-age=15'}});
}
