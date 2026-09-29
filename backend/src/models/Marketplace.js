import mongoose from 'mongoose';
const schema=new mongoose.Schema({
  seller:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  recycler:{type:mongoose.Schema.Types.ObjectId,ref:'User',default:null},
  material:{type:String,required:true},
  kg:{type:Number,required:true,min:1},
  askingPricePerKg:{type:Number,required:true,min:0},
  
  status:{
    type:String,
    enum:['OPEN','SOLD','CANCELLED'],
    default:'OPEN'
},

requestStatus:{
    type:String,
    enum:['NONE','PENDING','ACCEPTED','REJECTED'],
    default:'NONE'
}
},{timestamps:true});
export default mongoose.model('Marketplace',schema);
