import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import KanjiModel from './KanjiModel';
import cors from 'cors';
const NodeCache = require('node-cache');

const app = express();
const PORT = 5000; //LocalHost

app.use(express.json()); //parsing JSON requests
app.use(cors()); //We need to use CORS due to port number differences
dotenv.config();  //Loads variables from the .env file (Hiding secrets with .gitignore)

//Hide my mongoDB-URL
const mongoDBURL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.CLUSTER_NAME}.${process.env.OTHER}.mongodb.net/KanjiDB`;

const cache = new NodeCache({ stdTTL: 0 }) // Cache doesn't expire

  /** Connect to the DB using the mongoose library.
   * (Core code)
   */
mongoose.connect(mongoDBURL)
  .then(() => {
    console.log('Connected to:', 
      mongoose.connection.getClient().db().databaseName);

    app.listen(PORT, () => {
      console.log(`We are using Port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

  /*
  Check usage of indexes: (KanjiModel.ts Line 46 error)
  Indexes: { _id_: [ [ '_id', 1 ] ], kanji_1: [ [ 'kanji', 1 ] ] }
  
  KanjiModel.collection.getIndexes()
  .then(indexes => {
    console.log('Indexes:', indexes);
  })*/


  /** GET request of a single character.
   * Initially created to debug the MongoDB connection.
   */
app.get('/api/kanji/:character', async (req: Request, res: Response) => {
  const { character } = req.params;

  try {
    const kanjiData = await KanjiModel.findOne({ kanji: character }).select('wk_level -_id'); //Remove MongoDB ID.
    //console.log(kanjiData)

    if (kanjiData) {
      res.json(kanjiData);
    } else {
      res.status(404).send('Kanji not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching Kanji data');
  }
});

  /** Improved version of the previous GET.
   * Batched + Caching.
   */
app.post('/api/kanji/batch', async (req: Request, res: Response) => {
  const kanjiList: string[] = req.body.kanjiList; //Unique kanjis sent in from the frontend.
  //console.log(kanjiList) Inbound
  const kanjiLevels: Record<string, number> = {}; //Final Result
  const kanjiToFetch: string[] = []; //Kanji not in the cache

  for (const kanji of kanjiList) {
    const cachedData = cache.get(kanji);

    if (cachedData) {
      kanjiLevels[kanji] = cachedData;
    } else {
      kanjiToFetch.push(kanji);
    }
  }

  if (kanjiToFetch.length > 0) {
    try {
      const kanjiData = await KanjiModel.find({ 
        kanji: { $in: kanjiToFetch } 
      }).exec();

      kanjiData.forEach((data: any) => {
        const wk_level = data.wk_level;
        const kanji = data.kanji;

        kanjiLevels[kanji] = wk_level;
        cache.set(kanji, wk_level); 
      });

      //including both cached and fresh data
      res.json(kanjiLevels);
      //console.log(kanjiLevels) Outbound
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching Kanji data');
    }
  } else {
    //If all the Kanji were cached
    res.json(kanjiLevels);
  }
});

//npm start
