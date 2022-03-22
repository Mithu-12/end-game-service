const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.20dfc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function run () {
    try {
        await client.connect();
        console.log('database connection established');
        const database = client.db('sunglass_store')
        const sunglassCollection = database.collection('sunglass')
        const orderCollection = database.collection('order')
        const userCollection = database.collection('user')
        const reviewCollection = database.collection('review')

        app.get('/sunglass', async (req, res) => {
            const cursor = sunglassCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
            
        })
        app.get('/sunglass/:id', async (req, res) => {
            console.log(req.body);
            const id = req.params.id;
            const query = { _id:ObjectId(id) }
            const product = await sunglassCollection.findOne(query);
            res.json(product);
            console.log(product);

        })
        app.post('/sunglass', async (req, res) => {
            const service = req.body;
            const result = await sunglassCollection.insertOne(service);
            console.log('hit the post api', service);
            res.json(result);
        
            
        });
        app.delete('/sunglass/:id', async (req, res) => {
            const key = req.params.id;
            console.log(key);
            const query =  { _id: ObjectId(key) };
            const result = await sunglassCollection.deleteOne(query);
            res.json(result)
        })
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updateinfo = req.body;
            const filter = { _id: ObjectId(id) };
            sunglassCollection.updateOne(filter, {
                $set: {
                    name: updateinfo.name,
                    price: updateinfo.price,
                    description: updateinfo.description,
                    img: updateinfo.img,
                    email: updateinfo.email
                },
            })
            .then(result => res.json(result));
        })
        app.post('/review', async (req, res) => {
            const service = req.body;
            const result = await reviewCollection.insertOne(service);
            console.log('hit the post api', service);
            res.json(result);
        
            
        });
        app.get('/review', async (req, res) => {
            const result =  reviewCollection.find({});
            const review = await result.toArray();
            res.json(review);
        
            
        });
          
        app.post("/orderInfo", async (req, res) => {
            console.log(req.body)
            const order = req.body;
          const result = await orderCollection.insertOne(order);
              res.json(result);
              console.log(result);
  
        });
        app.get('/orders', async (req, res) =>  {
            let query = {};
            const email = req.query.email;
            if (email) {
                query = { email: email}
            }
            const result = await orderCollection.find(query);
            const order =  await result.toArray();
            res.json(order);
        })
        //user collection
        app.post('/user', async (req, res) => {
            const users = req.body;
            const result = await userCollection.insertOne(users)
            res.json(result);
            console.log(result);
        })
        
        app.put('/user', async (req, res) => {
            const users = req.body;
            console.log(users);
            const filter = { email: users.email };
            const options = { upsert: true };
            const updateDoc = { $set: users };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        app.put('/user/admin', async (req, res) => {
            const users = req.body;
            console.log(users);
            const filter = { email: users.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        app.put('/updateStatus/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body.status;
            const filter = { _id: ObjectId(id) };
            orderCollection.updateOne(filter, {
                $set: {status: updateStatus},
            })
            .then(result => res.json(result));
        })
        app.delete('/orders/:id', async (req, res) => {
            const key = req.params.id;
            console.log(key);
            const query =  { _id: ObjectId(key) };
            const result = await orderCollection.deleteOne(query);
            res.json(result)
        })
        app.get('/allOrder', async (req, res) =>  {
              
            const result = await orderCollection.find({});
            const order =  await result.toArray();
            res.json(order);
            console.log(order);
        })
        app.delete('/allOrder/:id', async (req, res) => {
            const key = req.params.id;
            console.log(key);
            const query =  { _id: ObjectId(key) };
            const result = await orderCollection.deleteOne(query);
            res.json(result)
        })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const users = await userCollection.findOne(query);
            let isAdmin = false;
            if (users?.role === 'admin') {
                isAdmin = true;
            }
            res.json({admin: isAdmin})
        })
        
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('server is running')
})
app.listen(port, ()=>{
    console.log('node monmone running on server', port);
})