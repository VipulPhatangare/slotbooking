const express = require('express');
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);


app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, 'public')));

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};
connectDB();

const port = process.env.PORT;

const userSchema = new mongoose.Schema({
    email : String,
    phoneNumber : Number,
    firstName : String,
    lastName : String,
    isSlotBokked : Boolean
});
const User = mongoose.model('User', userSchema);


app.get('/', async(req,res)=>{
  res.render('index')
});

app.post('/send_data',async (req,res)=>{
    const userData = req.body;
    // console.log(userData);

    try {
        const user = await User.findOne({ phoneNumber : userData.phone});
        const data = {
            email : userData.email,
            phoneNumber : userData.phone,
            firstName : userData.firstName,
            lastName : userData.lastName,
            isSlotBokked : false
        }
        if(user && user.isSlotBokked){
            return res.json({msg:'This phone number is already registered.',flag : false});
        }else if(user && user.isSlotBokked == false){
            await User.findOneAndUpdate(
                { phoneNumber: userData.phone },
                data,
                { new: true }
            );
        }else{
            const newUser = new User(data);
            await newUser.save();
        }
        return res.json({msg:'suceefull registration.',flag : true});
        
    } catch (error) {
        console.log(error);
        return res.json({msg:'Internet Problem..',flag : false});
    }
});


app.post('/bookslot',async (req,res)=>{
    const slotdata = req.body;
    // console.log(slotdata);

    try {
        const user = await User.findOne({ phoneNumber : slotdata.phone});
        if(user){
            await User.findOneAndUpdate(
                { phoneNumber: slotdata.phone },
                {isSlotBokked : true},
                { new: true }
            );

            const { data, error } = await supabase.rpc('increment_slot_count', {
                slot_date : slotdata.date,
                slot_time : slotdata.slot,
                data : slotdata.slotchangedata
            });

            if(error){
                return res.json({msg:'Internet Problem..',flag : false});
            }else{
                return res.json({msg:'Done',flag : true});
            }
        }

        return res.json({msg:'Not register yet.',flag : false});


    } catch (error) {
        console.log(error);
        return res.json({msg:'Internet Problem..',flag : false});
    }
});



app.get('/bookslotfetch', async(req,res)=>{
  try {
    const { data, error } = await supabase
        .from('slot_booking')
        .select('*');
    if(error){
        console.log(error);
    }else{
        return res.json(data);
        // console.log(data);
    }
    
  } catch (error) {
    console.log(error);
  }
});

app.listen(port,()=>{
    console.log('server listing at port',port);
})