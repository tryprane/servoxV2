import { truncateSync } from "fs";
import mongoose, {Schema , Document, model} from "mongoose";
import { isStringObject } from "util/types";

export interface IHero extends Document {

    name: string;
    imgLink: string;
    mobLink?: string;
    tabLink?: string;
}


const heroSchema = new Schema({

    name:{
        type:String,
        required: true
    },

    imgLink: {
     type : String,
     required: true
    },

    mobLink:{
     type:String
    },

    tabLink:{
        type:String
    }
});

export const HeroSchema = mongoose.model<IHero>('HeroSchema' , heroSchema);