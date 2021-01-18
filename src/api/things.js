import {
    getSolidDataset,
    createSolidDataset,
    saveSolidDatasetAt,
    setStringNoLocale,
    getStringNoLocale,
    setThing,
    getThingAll,
    getThing,
    setIri,
    getStringNoLocaleAll,
    setInteger,
    createThing,
    getNamedNodeAll,
    addIri,
    removeUrl,
    getIriAll,
    getMockQuad,
    removeThing,
} from "@inrupt/solid-client";
import _ from 'lodash';
import auth from "solid-auth-client";
import data from "@solid/query-ldflex";
import { v4 as uuid } from 'uuid';
import {graph, sym, Namespace, parse, Fetcher} from 'rdflib';

import { DataFactory } from "n3";

var RDF = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var FOAF = Namespace("http://xmlns.com/foaf/0.1/");
var DCT = Namespace("http://purl.org/dc/terms/");
var LDP = Namespace("http://www.w3.org/ns/ldp#");
var SIOC = Namespace("http://rdfs.org/sioc/ns#");
var SOLID = Namespace("http://www.w3.org/ns/solid/terms#");

export const getResource = async (URI) => {

    try {

        const myProfileDataset = await getSolidDataset(URI, {
            fetch: auth.fetch,
        });

        const x = Array.from(myProfileDataset.quads);



        return {
            values: _.map(x, a => {
                return {
                    subject: a.subject.id,
                    graph: a.graph.id,
                    predicate: a.predicate.id,
                    object: a.object.id,
                }
            }),
            error: {},
        };
    } catch (e) {
        return {
            error: e,
            values: [],
        };
    }
};

export const addHand = async () => {

    const file = 'https://jorge.pod.ideniox.com/ejemplo.ttl'

    const myExample = await getSolidDataset(file, {
        fetch: auth.fetch,
    });

    const jorge = await getThing(myExample, 'https://jorge.pod.ideniox.com/ejemplo.ttl#jorge')

    const newManoIri = file+'#'+uuid();

    console.log(newManoIri)

    let mano = await createThing({url: newManoIri})

    mano = setStringNoLocale(mano,'https://example.org/size', 'xxl')

    mano = setInteger(mano,'https://example.org/amount', 2);

    let updatedJorge = addIri(jorge, 'https://example.org/manos', newManoIri)

    let myChangedExample = setThing(myExample, updatedJorge)

    myChangedExample = setThing(myChangedExample, mano)

    const savedProfileResource = await saveSolidDatasetAt(
        file,
        myChangedExample,
        { fetch: auth.fetch}
    );
}

export const cleanHands = async () => {
    const file = 'https://jorge.pod.ideniox.com/ejemplo.ttl'

    const myExample = await getSolidDataset(file, {
        fetch: auth.fetch,
    });

    const jorge = await getThing(myExample, 'https://jorge.pod.ideniox.com/ejemplo.ttl#jorge')

    const manos = getIriAll(jorge, 'https://example.org/manos')

    let newJorge = jorge

    for (const iri of manos) {
        const mano = await getThing(myExample, iri);
        if (!mano) {

            newJorge = removeUrl(newJorge, 'https://example.org/manos', iri);
        }
    }

    console.log(getIriAll(newJorge, 'https://example.org/manos'))

    let myChangedExample = await setThing(myExample, newJorge);

    await saveSolidDatasetAt(
        file,
        myChangedExample,
        { fetch: auth.fetch}
    );
}

export const deleteHands = async () => {
    const file = 'https://jorge.pod.ideniox.com/ejemplo.ttl';

    const myExample = await getSolidDataset(file, {
        fetch: auth.fetch,
    });

    const jorge = await getThing(myExample, 'https://jorge.pod.ideniox.com/ejemplo.ttl#jorge');

    const manos = getIriAll(jorge, 'https://example.org/manos');

    let newJorge = jorge;

    let myNewExample = myExample;

    for (const iri of manos) {
        myNewExample = removeThing(myNewExample, iri);
        newJorge = removeUrl(newJorge, 'https://example.org/manos', iri);
    }

    myNewExample = await setThing(myNewExample, newJorge);

    await saveSolidDatasetAt(
        file,
        myNewExample,
        { fetch: auth.fetch}
    );
}



function getQuad1(terms) {
    const subject = DataFactory.namedNode(
        terms.subject ?? "https://arbitrary.vocab/subject"
    );
    const predicate = DataFactory.namedNode(
        terms.predicate ?? "https://arbitrary.vocab/predicate"
    );
    const object = DataFactory.namedNode(
        terms.object ?? "https://arbitrary.vocab/object"
    );
    const namedGraph = terms.namedGraph
        ? DataFactory.namedNode(terms.namedGraph)
        : undefined;

    return DataFactory.quad(subject, predicate, object, namedGraph);
}

function getQuad2(blank) {
    return DataFactory.quad(
        blank,
        DataFactory.namedNode('https://example.org/has'),
        DataFactory.literal("x"),
    )
}

function getQuad3(blank) {
    return DataFactory.quad(
        DataFactory.namedNode('https://jorge.pod.ideniox.com/ejemplo#jorge'),
        DataFactory.namedNode('https://example.org/has'),
        blank,
    )
}

export const addMessage = async () => {

    const file = 'https://jorge.pod.ideniox.com/ejemplo.ttl';

    const blank = DataFactory.blankNode();

    const myProfileDataset = await getSolidDataset(file, {
        fetch: auth.fetch,
    });

    let myUpdateProfileDataset = myProfileDataset.add(getQuad2(blank));
    myUpdateProfileDataset = myUpdateProfileDataset.add(getQuad3(blank));

    await saveSolidDatasetAt(
        file,
        myUpdateProfileDataset,
        { fetch: auth.fetch}
    );
};
