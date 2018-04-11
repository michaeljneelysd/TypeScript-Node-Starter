import * as mongoose from "mongoose";
import { Conversation } from "../models/Conversation";
import { Reference } from "../models/Reference";

// An array of these objects is formatted by the 'results' template
export type FinalSummary = {
    reference: {
        name: string,
        summary: string
    };
    generated: Array<GeneratedSummary>,
};


// Object that shows combines all aspects of a summary generated by the application
export type  GeneratedSummary = {
    reference: Reference,
    method: string,
    summary: Array<SummaryTerm>,
    scores: Array<SummaryMetric>
};

// Object that expresses a summary metric and its corresponding score
export type SummaryMetric = {
    method: string,
    score: string
};

// Used by 'results' template to display terms in the generated summary that match the reference summary
export type SummaryTerm = {
    match: boolean,
    term: string
};

export interface ISummary {
    method: string;
    summary: string;
    lemmas?: Map<string, number>;
    candidateTerms?: Map<string, number>;
    namedEntities?: Map<string, number>;
}

export abstract class Summary {

    // Conversation object
    protected conversation: Conversation;

    // If the summary implementation requires a User Id
    protected userId: mongoose.Types.ObjectId;

    // Reference summaries used to score generated ones
    protected references: Array<Reference>;

    // User defined keywords in conversation
    protected keywords: Array<string>;

    protected lemmas: Map<string, number>;

    protected candidateTerms: Map<string, number>;

    protected namedEntities: Map<string, number>;

    // Name of method used to generate summaries
    protected summaryMethod: string;

    constructor(conversation: Conversation, references: Array<Reference>, keywords: Array<string>, userId?: mongoose.Types.ObjectId, lemmas?: Map<string, number>, candidateTerms?: Map<string, number>, namedEntities?: Map<string, number>) {
        this.conversation = conversation;
        this.references = references;
        this.keywords = keywords;
        this.lemmas = lemmas || undefined;
        this.candidateTerms = candidateTerms || undefined;
        this.namedEntities = namedEntities || undefined;
        this.userId = userId || undefined;
    }

    // Generate and Score Summaries
    public async abstract summarize(): Promise<Array<GeneratedSummary>>;

}

/**
 * Helper function that generates an Array of Summary Term objects that are used by the 'results' template to show matches
 * @param {Array<string>} generated Generated Summary terms
 * @param {string} reference User-provided reference summaries
 */
export function buildSummaryTermArray(generated: Array<string>, reference: string): Array<SummaryTerm> {
    return generated.map((term) => {
        const match = new RegExp("\\b" + term + "\\b", "i").test(reference);
        return {
            term,
            match
        };
    });
}
