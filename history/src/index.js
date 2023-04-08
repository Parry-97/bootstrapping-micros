//Create an express application to be deployed as a microservice that listen to a PORT specified as an environment variable
//Import required modules
const amqp = require("amqplib");
const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");

const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;
const RABBIT = process.env.RABBIT;
// ...

if (!process.env.PORT) {
  throw new Error("PORT environment variable is required");
}

console.log("Hello from history microservice after change!");

const PORT = process.env.PORT;

async function main() {
  const app = express();

  const messagingConnection = await amqp.connect(RABBIT);
  const messageChannel = await messagingConnection.createChannel();

  app.use(bodyParser.json());
  const client = await mongodb.MongoClient.connect(DBHOST);
  const db = client.db(DBNAME);
  const videosCollection = db.collection("videos");
  // ... add route handlers here ...
  async function consumeViewedMessage(msg) {
    const parsedMsg = JSON.parse(msg.content.toString());
    await videosCollection.insertOne({ videoPath: parsedMsg.videoPath });
    messageChannel.ack(msg);
  }

  //NOTE: The code then asserts the existence of the "viewed" exchange as a fanout exchange.
  //It then creates a new queue with a random name by calling assertQueue.
  //The "exclusive" option means that the queue will be deleted when the connection to
  //RabbitMQ is closed
  await messageChannel.assertExchange("viewed", "fanout");
  const { queue } = await messageChannel.assertQueue("", { exclusive: true });

  //NOTE: The code then binds the newly created queue to the "viewed" exchange with an
  //empty routing key by calling "messageChannel.bindQueue(queue, "viewed", "")".
  //This means that the queue will receive all messages published to the "viewed" exchange.
  await messageChannel.bindQueue(queue, "viewed", "");
  await messageChannel.consume(queue, consumeViewedMessage);

  await messageChannel.assertQueue("viewed", {});
  await messageChannel.consume("viewed", consumeViewedMessage);

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
