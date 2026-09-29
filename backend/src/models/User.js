import mongoose from 'mongoose';
const schema=new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxLength:100},
  phone:{type:String,required:true,unique:true,index:true},
  email:{type:String,lowercase:true,trim:true},
  passwordHash:{type:String,required:true},
  role:{type:String,enum:['USER','COLLECTOR','RECYCLER','ORGANIZATION','ADMIN'],default:'USER'},
  address:{type:String,trim:true,maxLength:500},
  verified:{type:Boolean,default:false},
  greenCredits:{type:Number,default:0,min:0}
},{timestamps:true});
export default mongoose.model('User',schema);
