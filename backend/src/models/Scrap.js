import mongoose from 'mongoose';
const schema=new mongoose.Schema({
  name:{type:String,required:true,unique:true,trim:true},
  unit:{type:String,default:'kg'},
  rate:{type:Number,required:true,min:0},
  active:{type:Boolean,default:true}
},{timestamps:true});
export default mongoose.model('Scrap',schema);
