const express = require("express");
const http = require("http");
const mongodb = require("mongodb");
const amqp = require("amqplib");

const app = express();

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;
const RABBIT = process.env.RABBIT;

async function main() {
  const client = await mongodb.MongoClient.connect(DBHOST);
  const db = client.db(DBNAME);
  const videosCollection = db.collection("videos");

  const messagingConnection = await amqp.connect(RABBIT);
  const messageChannel = await messagingConnection.createChannel();

  await messageChannel.assertExchange("viewed", "fanout");

  app.get("/video", async (req, res) => {
    let videoPath = "sample.mp4";
    sendViewedMessage(messageChannel, videoPath);
    res.sendStatus(200);
    //   const videoId = new mongodb.ObjectId(req.query.id);
    //   const videoRecord = await videosCollection.findOne({ _id: videoId });
    //   if (!videoRecord) {
    //     res.sendStatus(404);
    //     return;
    //   }
    //
    //   const forwardRequest = http.request(
    //     {
    //       host: VIDEO_STORAGE_HOST,
    //       port: VIDEO_STORAGE_PORT,
    //       path: `/video?path=${videoRecord.videoPath}`,
    //       method: "GET",
    //       headers: req.headers,
    //     },
    //     (forwardResponse) => {
    //       res.writeHeader(forwardResponse.statusCode, forwardResponse.headers);
    //       forwardResponse.pipe(res);
    //       sendViewedMessage(videoPath);
    //     }
    //   );
    //
    //   req.pipe(forwardRequest);
  });
  //
  // //
  // // Starts the HTTP server.
  // //
  app.listen(PORT, () => {
    console.log(
      `Hello from the video-streaming microservice listening on PORT ${PORT}`
    );
  });
}

//function to send and http POST request to the history microservice for a viewed message
function sendViewedMessage(messageChannel, videoPath) {
  const msg = { videoPath: videoPath };
  const jssonMsg = JSON.stringify(msg);
  //NOTE: The code publishes the message to the "viewed" exchange with an empty routing key.
  //This means that the message will be published to all queues bound to the "viewed" exchange.
  //when the publish method is called with an empty routing key and a fanout
  //exchange type is used, the message will be sent to all queues bound to the
  //exchange. This is because fanout exchanges distribute messages to all queues
  //that are bound to them, regardless of the routing key.
  messageChannel.publish("viewed", "", Buffer.from(jssonMsg));

  ///NOTE: The code sends the message to the "viewed" queue of the default exchange.
  // messageChannel.publish("", "viewed", Buffer.from(jssonMsg));
  // messageChannel.sendToQueue("viewed", Buffer.from(jssonMsg));
}

main().catch((err) => {
  console.error("Microservice failed to start.");
  console.error((err && err.stack) || err);
});
