/** @format */

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("education Toys server is running...");
});



const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uhkmpi6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
  //  await client.connect();

    const toysCollection = client.db("education").collection("toys");

  
 //get all data
    app.get("/toys",async(req, res) => {
      const startAt = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 20;
      const skip = startAt * limit;
      const result = await toysCollection.find().skip(skip).limit(startAt).toArray();
      res.send(result); 
    });

 //input code.txt line by line in below field 

    //delete  section data by id
    // it is completed code  for deleted data
    app.delete("/toys/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toys = req.body;
      // console.log(toys);
      const result = await toysCollection.insertOne(toys);
      res.send(result);
    });

       // get data by toy name
    app.get("/toys/name", async (req, res) => {
      const name = req.query.toyName;
      // console.log(name);
      const result = await toysCollection
        .find({ toyName: { $regex: name, $options: "i" } })
        .toArray();
      res.send(result);
    });

     // get limited data
    app.get("/toys/limit/:limit", async (req, res) => {
      const limit = parseInt(req.params.limit);
      const result = await toysCollection.find().limit(limit).toArray();
      res.send(result);
    });

      // get data by category
    app.get("/toys/category/:category", async (req, res) => {
      const category = req.params.category;
      const query = { subCategory: category };
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    
    // get data by email
    app.get("/toys/:email", async (req, res) => {
      const email = req.params.email;
      const num = parseInt(req.query.num);
      // console.log(req.query.num);
      const query = { sellerEmail: email };
      const result = await toysCollection
        .find(query)
        .sort({ price: num })
        .collation({ locale: "en_US", numericOrdering: true })
        .toArray();
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
