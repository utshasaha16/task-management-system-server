const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iwlha.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const taskCollection = client.db("taskManagementDb").collection("task");
    const usersCollection = client.db("taskManagementDb").collection("users");


    // users related apis
    app.post("/users", async(req, res) => {
        const user = req.body;
        // check existing user 
        const query = {email: user.email};
        const existingUser = await usersCollection.findOne(query);
        if(existingUser) {
          return res.send({message: "user already exists", insertedId: null})
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
    })

    // task related apis
    app.post("/addTask", async (req, res) => {
      const newTask = req.body;
      const result = await taskCollection.insertOne(newTask);
      res.send(result);
    });

    app.get("/tasks", async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    });

    app.get("/tasks/:id", async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await taskCollection.findOne(query);
      res.send(result);
    });

    app.patch("/tasks/:id", async(req, res) => {
      const task = req.body;
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set: {
          title: task.title,
          descripotion: task.description,
          status: task.status
        }
      }
      const result = await taskCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.delete("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await taskCollection.deleteOne(query);
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

app.get("/", (req, res) => {
  res.send("Task Manager API");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
