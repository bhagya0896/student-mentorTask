const express = require ('express');
const app = express();

const mongodb = require ('mongodb');
const mongoClient = mongodb.MongoClient;

app.use(express.json());
let dburl="mongodb://127.0.0.1:27017";
const objectid = mongodb.ObjectID;


// Api route to get student,mentor data

app.get('/student',  async (req,res) => {
    try{
      
     let client = await mongoClient.connect(dburl);
     let db = client.db('student_mentor_db');
     let data = await db.collection('students').find().toArray();
     console.log(data);  
     res.status(200).json(data);
     client.close();
    }catch(error)
    {
        console.log(error);
    }  
 });

 app.get('/mentor',  async (req,res) => {
    try{
      
     let client = await mongoClient.connect(dburl);
     let db = client.db('student_mentor_db');
     let data = await db.collection('mentors').find().toArray();
     console.log(data);  
     res.status(200).json(data);
     client.close();
    }catch(error)
    {
        console.log(error);
    }  
 });

// Api route to create new student

app.post('/create-student',  async (req,res) => {
    try{
      
     let client = await mongoClient.connect(dburl);
     let db = client.db('student_mentor_db');
      await db.collection('students').insertOne(req.body)
     console.log("inserted student data into students collection");  
     res.status(200).json({"message":"new student created sucessfully"});
     client.close();
    }catch(error)
    {
        console.log(error);
    }  
 });


//Api route to create new mentor

app.post('/create-mentor',  async (req,res) => {
    try{
      
     let client = await mongoClient.connect(dburl);
     let db = client.db('student_mentor_db');
     await db.collection('mentors').insertOne(req.body)
     console.log("inserted mentor data into mentors collection");  
     res.status(200).json({"message":"new mentor created sucessfully"});
     client.close();
    }catch(error)
    {
        console.log(error);
    }  
 });


// Api route to get student and mentor data with particular id

app.get('/student/:id', async (req,res) => {
    try{
     
    const {id} = req.params ;
     let client = await mongoClient.connect(dburl);
     let db = client.db('student_mentor_db');
     let data = await  db.collection('students').findOne({"_id" : objectid(id)});
     console.log(data);  
     res.status(200).json(data);
     client.close();

    }catch(error)
    {
        console.log(error);
    }
  
 });


 app.get('/mentor/:id', async (req,res) => {
    try{
     
    const {id} = req.params ;
     let client = await mongoClient.connect(dburl);
     let db = client.db('student_mentor_db');
     let data = await  db.collection('mentors').findOne({"_id" : objectid(id)});
     console.log(data);  
     res.status(200).json(data);
     client.close();

    }catch(error)
    {
        console.log(error);
    }
  
 });


// Api route to assign or change mentor of a particular student

app.patch('/student/:id/assign-mentor', async (req,res) => {
    try{
     
    const {id}=req.params;
    const {assigned_mentorid}=req.body;
    console.log(id);
     let client = await mongoClient.connect(dburl);
     let db = client.db('student_mentor_db');
     await db.collection('students').update({'_id':objectid(id)},{$set:{'assigned_mentorId':objectid(assigned_mentorid)}});
     await db.collection('mentors').update({"_id":objectid(assigned_mentorid)},{$push : {"assigned_studentidlist":objectid(id)}});
     res.status(200).json({"message":`mentor assigned to student of id ${id} successfully`});
     client.close();

    }catch(error)
    {
        console.log(error);
    }
  
 });


// Api route to assign multiple students to mentor

app.patch('/mentor/:id/assign-student', async(req,res)=>
{
 try{
        const {id} = req.params;
        const {studentidlist} = req.body;
        console.log(studentidlist);
        let client = await mongoClient.connect(dburl);
        let db = client.db('student_mentor_db');
        await db.collection('mentors').update({"_id":objectid(id)},{$set:{"assigned_studentidlist":studentidlist}});
        console.log(studentidlist);
     studentidlist.map((ele)=>
        {
          let student = db.collection('students').findOne({_id:objectid(ele)});
          if(student)  db.collection('students').update({_id:objectid(ele)},{$set:{"assigned_mentorId":objectid(id)}});
        })
        res.status(200).json({"message":`students assigned to mentor of id ${id} successfully`});
        client.close();
    
    }catch(error)
    {console.log(error)}
});


// Api route to show all students of a particular mentor


app.get('/mentor/:id/studentlist', async (req,res) => {
    try{

     const {id}=req.params;
     console.log(id);
     let client = await mongoClient.connect(dburl);
     let db = client.db('student_mentor_db');
     let data = await db.collection('mentors').find({"_id":objectid(id)}).project({"assigned_studentidlist":1,"_id":0}).toArray();
     res.status(200).json(data);
     client.close();

    }catch(error)
    {
        console.log(error);
    }
  
 });

// Api route to delete particular  mentor or student



app.delete('/mentor/:id', async (req,res) => {
    try{

     const {id}=req.params;
     console.log(id);
     let client = await mongoClient.connect(dburl);
     let db = client.db('student_mentor_db');
     await db.collection('mentors').findOneAndDelete({"_id":objectid(id)});
     await db.collection('students').update({"assigned_mentorId":objectid(id)},{$set :{"assigned_mentorId":""}});
     res.status(200).json({"message":`mentor with id ${id} is deleted`});
     client.close();

    }catch(error)
    {
        console.log(error);
    }
  
 });

 app.delete('/student/:id', async (req,res) => {
    try{

        const { id } = req.params;
        console.log(id);
        let client = await mongoClient.connect(dburl);
        let db = client.db('student_mentor_db');
        await db.collection('students').deleteOne({ _id: objectid(id) });
        let data = await db.collection('mentors').update({ "assigned_studentidlist":{$in:[objectid(id)]}},{$pop:{"assigned_studentidlist":objectid(id)}});//
        console.log(data);
        client.close();

       }catch(error)
       {
           console.log(error);
       }
     
    });
 


app.listen('4000',()=>{console.log('server running successfully on port 4000')});
