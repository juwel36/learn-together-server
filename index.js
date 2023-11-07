const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middileware
app.use(cors({
origin:['http://localhost:5173'],
credentials:true

}))
app.use(express.json())
app.use(cookieParser())








const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9ofe0jv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});




// custom midddleware
const verifyToken = async (req,res,next)=>{
  const token =req.cookies?.token
  // console.log(token);
  if(!token){
  return res.status(401).send({message:'not authorized'})
  }
  
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
   
  if(err){
  console.log('1st ----',err);
  return res.status(401).send({message:'unauthorized'})
  }
  
  req.user=decoded;
  next()
  })
  
  }





async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const assignmentsCollection = client.db("createAssignmentsDB").collection("createAssignments")
    const submitCollection = client.db("createAssignmentsDB").collection("SubmitAssignments")
    const feedbackCollection = client.db("createAssignmentsDB").collection("Assignmentsfeedback")





app.post('/jwt',async(req,res)=>{
const user=req.body
// console.log(user);
const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})

res
.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

})

.send({success:true})
})

app.post('/logout',async(req,res)=>{
  const user=req.body
  // console.log('logging out',user);
  res.clearCookie('token',{maxAge:0, secure: process.env.NODE_ENV === 'production', 
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',})
  .send({succsess:true})
  })
  






    // for validation
    app.get('/assignmentCount', async (req, res) => {
      const count = await assignmentsCollection.estimatedDocumentCount();
      res.send({ count })
    })




    // feedback
    app.post('/feedback', async (req, res) => {
      const user = req.body
      const result = await feedbackCollection.insertOne(user);
      res.send(result)
    })


    // read feedback
    app.get('/feedback',verifyToken, async (req, res) => {


      if(req.query.email !== req.user.email){
        return res.status(403).send({message: 'forbiden'})
      }

      let query={};
      if(req.query?.email){
        query={email: req.query.email}
      }

      const cursor = feedbackCollection.find(query)
      const result = await cursor.toArray()

      res.send(result)
    })


    // delete feedback
    app.delete('/feedback/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await feedbackCollection.deleteOne(query)
      res.send(result)
    })

    // //  update feedback
    app.patch('/submit/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatebooking = req.body;
      const updateDoc = {
        $set: {
          status: updatebooking.status
        }
      }
      const result = await submitCollection.updateOne(filter, updateDoc)
      res.send(result)

    })









    // create submit
    app.post('/submit', async (req, res) => {
      const user = req.body
      const result = await submitCollection.insertOne(user);
      res.send(result)
    })

    // read submit
    app.get('/submit', async (req, res) => {
      const cursor = submitCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    // search single data
    app.get('/submit/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const user = await submitCollection.findOne(query)
      res.send(user)
    })





    // create
    app.post('/create', async (req, res) => {
      const user = req.body
      const result = await assignmentsCollection.insertOne(user);
      res.send(result)
    })


    // read
    app.get('/create', async (req, res) => {
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)


      const result = await assignmentsCollection.find()

        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);

    })


    //read  singledata
    app.get('/create/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const user = await assignmentsCollection.findOne(query)
      res.send(user)
    })




    // update create data
    app.put('/create/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updateuser = req.body;
      const user = {
        $set: {
          title: updateuser.title,
          marks: updateuser.marks,
          image: updateuser.image,
          Deficalty: updateuser.Deficalty,
          date: updateuser.date,
          description: updateuser.description,
        }
      }

      const result = await assignmentsCollection.updateOne(filter, user, options)
      res.send(result)

    })

    // update status
    app.patch('/create/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatebooking = req.body;
      const updateDoc = {
        $set: {
          status: updatebooking.status
        }
      }
      const result = await assignmentsCollection.updateOne(filter, updateDoc)
      res.send(result)

    })

    // delete
    app.delete('/create/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await assignmentsCollection.deleteOne(query)
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