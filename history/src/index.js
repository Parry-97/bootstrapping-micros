//Create an express application to be deployed as a microservice that listen to a PORT specified as an environment variable
//Import required modules

const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;
// ...

if (!process.env.PORT) {
  throw new Error("PORT environment variable is required");
}

console.log("Hello from history microservice after change!");

const PORT = process.env.PORT;

async function main() {
  const app = express();
  app.use(bodyParser.json());
  const client = await mongodb.MongoClient.connect(DBHOST);
  const db = client.db(DBNAME);
  const videosCollection = db.collection("videos");
  // ... add route handlers here ...

  //Add a POST handler for the /viewed route to add the viewed video path to the mongo database videos collection
  app.post("/viewed", async (req, res) => {
    const videoPath = req.body.videoPath;
    await videosCollection.insertOne({ videoPath: videoPath });

    console.log(`Added video path ${videoPath} to history`);
    res.sendStatus(200);
  });

  app.listen(PORT, () => {
    console.log("Microservice online.");
  });
}

main().catch((err) => {
  console.error("Microservice failed to start.");
  console.error((err && err.stack) || err);
});
