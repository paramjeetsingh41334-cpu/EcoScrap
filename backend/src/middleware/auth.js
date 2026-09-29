import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function requireAuth(req,res,next){
  try{
    const header=req.headers.authorization;
    if(!header?.startsWith('Bearer ')) return res.status(401).json({message:'Authentication required'});
    const payload=jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user=await User.findById(payload.sub).select('-passwordHash');
    if(!user) return res.status(401).json({message:'Invalid session'});
    req.user=user;
    next();
  }catch{ return res.status(401).json({message:'Invalid or expired token'}); }
}
export const allowRoles=(...roles)=>(req,res,next)=>{
  if(!roles.includes(req.user.role)) return res.status(403).json({message:'Insufficient permissions'});
  next();
};
