import {Router} from 'express';
import Scrap from '../models/Scrap.js';
import {requireAuth,allowRoles} from '../middleware/auth.js';
const r=Router();
r.get('/',async(_,res,next)=>{try{res.json(await Scrap.find({active:true}).sort('name'))}catch(e){next(e)}});
r.post('/',requireAuth,allowRoles('ADMIN'),async(req,res,next)=>{try{res.status(201).json(await Scrap.create(req.body))}catch(e){next(e)}});
r.post('/seed',requireAuth,allowRoles('ADMIN'),async(req,res,next)=>{try{const defaults=[['Paper',15],['Cardboard',10],['Plastic',20],['Iron',35],['Aluminium',130],['Copper',600],['E-waste',80]]; for(const [name,rate] of defaults) await Scrap.updateOne({name},{$setOnInsert:{name,rate}},{upsert:true}); res.json({message:'Seeded'})}catch(e){next(e)}});
export default r;
