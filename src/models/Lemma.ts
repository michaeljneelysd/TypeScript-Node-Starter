import * as mongoose from "mongoose";
import { arrayProp, prop, Typegoose } from "typegoose";
import { DocumentFrequency } from "./DocumentFrequency";

export class CorpusLemma extends Typegoose {
    @prop({ required: true })
    lemma: string;
    @arrayProp({ items: DocumentFrequency })
    frequencies: Array<DocumentFrequency>;
}

export const CorpusLemmaModel = new CorpusLemma().getModelForClass(CorpusLemma, {
    existingConnection: mongoose.connection,
    schemaOptions : {
        timestamps: true
    }
});

export class UserLemma extends Typegoose {
    @prop({ required: true, index: true })
    owner: mongoose.Types.ObjectId;
    @prop({ required: true })
    lemma: string;
    @arrayProp({ items: DocumentFrequency })
    frequencies: Array<DocumentFrequency>;
}

export const UserLemmaModel = new UserLemma().getModelForClass(UserLemma, {
    existingConnection: mongoose.connection,
    schemaOptions : {
        timestamps: true
    }
});
