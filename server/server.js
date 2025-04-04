const express=require('express');
require('dotenv').config();
const mongoose=require('mongoose');
const cors=require('cors');
const app=express();
app.use(cors({
  origin:"https://zest-travel.vercel.app",
  credentials: true
}));
/////
const adminRoutes=require('./routes/adminauth');
const userRoutes=require('./routes/userauth');
mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser:true,useUnifiedTopology:true})
  .then(()=>console.log("MongoDB connected"))
  .catch(err=>console.log(err));

app.use(express.json());
app.use('/api/admin',adminRoutes);
app.use('/api/user',userRoutes);
const PORT=3000
app.listen(PORT,()=>{
  console.log(`Server is running on port ${PORT}`);
});