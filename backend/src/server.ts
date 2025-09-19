import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import KanjiModel from './KanjiModel';
import cors from 'cors';
const NodeCache = require('node-cache');

dotenv.config();  //Loads variables from the .env file (Hiding secrets with .gitignore)

const app = express();
const PORT = 5000; //LocalHost

app.use(express.json()); //parsing JSON requests

//Hide my mongoDB-URL
const mongoDBURL = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.CLUSTER_NAME}.${process.env.OTHER}.mongodb.net/KanjiDB`;

//We need to use CORS due to port number differences
app.use(cors());

const cache = new NodeCache({ stdTTL: 0 }) // Cache doesn't expire

mongoose.connect(mongoDBURL)
  .then(() => {
    console.log('Connected to: ', 
      mongoose.connection.getClient().db().databaseName);

    app.listen(PORT, () => {
      console.log(`We are using Port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.get('/api/kanji/:character', async (req: Request, res: Response) => {
  const { character } = req.params;

  try {
    const kanjiData = await KanjiModel.findOne({ kanji: character }).select('wk_level -_id'); //Remove MongoDB ID.
    console.log(kanjiData)

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

app.post('/api/kanji/batch', async (req: Request, res: Response) => {
  //Array of unique Kanjis from frontend
  const kanjiList: string[] = req.body.kanjiList;  
  //Final Result
  const kanjiLevels: any = {};  
  //Kanji not in the cache
  const kanjiToFetch: string[] = [];


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
      const kanjiData = await KanjiModel.find({ kanji: { $in: kanjiToFetch } });

      kanjiData.forEach((data: any) => {
        const wk_level = data.wk_level;
        const kanji = data.kanji;

        kanjiLevels[kanji] = wk_level;
        cache.set(kanji, wk_level); 
      });

      //including both cached and fresh data
      res.json(kanjiLevels);
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