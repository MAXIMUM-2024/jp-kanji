
/*
Data modified from https://github.com/davidluzgouveia/kanji-data/blob/master/kanji-wanikani.json
Thank you so much for the pre-made data.
Check WK_Data.json for the format.
Notice: This is stored in the MongoDB cloud. KanjiDB (Database) -> WaniKanji_Data (Collection) that contains the WK_Data.json file.
*/

import mongoose, { Schema, Document } from 'mongoose';

interface Kanji extends Document {
  kanji: string;
  strokes: number;
  grade: number;
  freq: number;
  jlpt_old: number;
  jlpt_new: number;
  meanings: string[];
  readings_on: string[];
  readings_kun: string[];
  wk_level: number;
  wk_meanings: string[];
  wk_readings_on: string[];
  wk_readings_kun: string[];
  wk_radicals: string[];
}

const kanjiSchema: Schema = new Schema<Kanji>({
  kanji: { type: String, required: true, unique: true },       //Kanji character
  strokes: { type: Number, required: false },                  //Number of strokes
  grade: { type: Number, required: false },                    //Grade level
  freq: { type: Number, required: false },                     //Frequency
  jlpt_old: { type: Number, required: false },                 //Old JLPT level
  jlpt_new: { type: Number, required: false },                 //New JLPT level
  meanings: { type: [String], required: false },               //Array of meanings
  readings_on: { type: [String], required: false },            //Array of On readings
  readings_kun: { type: [String], required: false },           //Array of Kun readings
  wk_level: { type: Number, required: false },                 //WaniKani level
  wk_meanings: { type: [String], required: false },            //Array of WaniKani meanings
  wk_readings_on: { type: [String], required: false },         //Array of WaniKani On readings
  wk_readings_kun: { type: [String], required: false },        //Array of WaniKani Kun readings
  wk_radicals: { type: [String], required: false },            //Array of WaniKani radicals
});

//Error: Warning: Duplicate schema index (Already added)
//Bottom line was needed for the 1st time we ran the code.
//kanjiSchema.index({ kanji: 1 }); //Create an index on the Kanji field to make lookups faster on MongoDB

const KanjiModel = mongoose.model<Kanji>('Kanji', kanjiSchema, 'WaniKanji_Data');

export default KanjiModel;