declare module "corenlp" {

    import * as _ from "lodash";

    namespace CoreNLP.simple {
        class Annotator {
            constructor(name: string, options: any, dependencies: Array<Annotator>);
            public toString(): string;
            public equalsTo(): boolean;
            public options(): any;
            public option(key: string, value: string|boolean): string;
            public dependencies(): Array<Annotator>;
            public pipeline(): Array<string>;
            public pipelineOptions(): Array<string>;
        }
        class Annotable {
            constructor(text: string);
            public text(): string;
            public setLanguage(iso: string): void;
            public getLanguage(): string;
            public addAnnotator(annotator: Annotator): void;
            public removeAnnotator(annotator: Annotator): void;
            public hasAnnotator(annotator: Annotator): boolean;
            public hasAnyAnnotator(annotators: Array<Annotator>): boolean;
            public parse(): string;
        }
        class Sentence extends Annotable {
            constructor(text: string);
            public toString(): string;
            public index(): number;
            public parse(): string;
            public words(): Array<string>;
            public word(index: number): string;
            public posTags(): Array<string>;
            public posTag(index: number): string;
            public lemmas(): Array<string>;
            public lemma(index: number): string;
            public nerTags(): Array<string>;
        }
    }

    namespace CoreNLP.util {
        class Tree {
            public static fromSentence(sentence: CoreNLP.simple.Sentence, doubleLink: boolean): Tree;
            public dump(): string;
        }
    }

    export class ConnectorServer {
        constructor(properties: any);
    }

    export class Pipeline {
        constructor(properties: any, language: string);
        constructor(properties: any, language: string, connector: ConnectorServer);
        public annotate (annotable: CoreNLP.simple.Annotable): Promise<CoreNLP.simple.Annotable>;
    }

    export class Properties {
        constructor(props: any);
    }

    export default CoreNLP;
}
