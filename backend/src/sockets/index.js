import {Server} from 'socket.io';
let io=null;
export function initSockets(server){
 io=new Server(server,{cors:{origin:process.env.CLIENT_URL||'http://localhost:5173'}});
 io.on('connection',socket=>{
   socket.on('auction:join',id=>socket.join(`auction:${id}`));
   socket.on('auction:leave',id=>socket.leave(`auction:${id}`));
 });
}
export function auctionIO(){return io;}
