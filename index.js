const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors= require('cors')
require('dotenv').config()
const app = express()
const port =  process.env.PORT || 5000

// middileware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ofe0jv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const assignmentsCollection =client.db("createAssignmentsDB").collection("createAssignments")


// create
app.post('/create',async(req,res)=>{
const user=req.body
const result = await assignmentsCollection.insertOne(user);
res.send(result)
})


// read
app.get('/create',async(req,res)=>{
  const cursor=assignmentsCollection.find()
  const result=await cursor.toArray()
  res.send(result)
  })

  //read  singledata
app.get('/create/:id',async(req,res)=>{
const id=req.params.id
const query={_id: new ObjectId(id)} 
const user=await assignmentsCollection.findOne(query)
res.send(user)
})

// update create data
app.put('/create/:id',async(req,res)=>{
  const id =req.params.id;
  const filter = {_id: new ObjectId(id)}
  const options={upsert:true}
  const updateuser=req.body;
  const user ={
    $set:{
      title:updateuser.title,
      marks:updateuser.marks,
      image:updateuser.image,
      Deficalty:updateuser.Deficalty,
      date:updateuser.date,
      description:updateuser.description,
    }
    }

    const result = await assignmentsCollection.updateOne(filter,user,options)
    res.send(result)

})

// update status
app.patch('/create/:id',async(req,res)=>{
  const id =req.params.id;
  const filter = {_id: new ObjectId(id)}
const updatebooking=req.body;
const updateDoc={
$set:{
  status:updatebooking.status
}
}
const result = await assignmentsCollection.updateOne(filter,updateDoc)
res.send(result)

})




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello learner people!')
})

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})