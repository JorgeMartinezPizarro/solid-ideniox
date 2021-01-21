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

import {getWebId} from "./user";

import * as N3 from 'n3';

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

export const addMessage = async () => {

    const file = 'https://jorge.pod.ideniox.com/ejemplo.ttl';

    const blank = DataFactory.blankNode();

    const myProfileDataset = await getSolidDataset(file, {
        fetch: auth.fetch,
    });

    let myUpdateProfileDataset = myProfileDataset//.add(getQuad2(blank));
    //myUpdateProfileDataset = myUpdateProfileDataset.add(getQuad3(blank));

    for (const quad of myProfileDataset) {

        if (quad.object.value === 'x') {

            const s = quad.subject;
            const p = quad.predicate;
            myUpdateProfileDataset = myUpdateProfileDataset.delete(quad);
            myUpdateProfileDataset = myUpdateProfileDataset.add(DataFactory.quad(
                s,
                p,
                DataFactory.literal("y")
            ))
        }
    }

    console.log(await saveSolidDatasetAt(
        file,
        myUpdateProfileDataset,
        { fetch: auth.fetch}
    ));
};

export const getProfile = async () => {

    const webId = await getWebId();

    const ds = await getSolidDataset(webId, {fetch: auth.fetch});

    const values = await getValues('NamedNode', webId, ds)

    console.log(values);

    return values;
}

const getValues = async (nodeType, value, ds) => {

    const values = {
        [value]: {}
    };

    for (const quad of ds) {
        if (quad.subject.termType === nodeType &&quad.subject.value === value) {
            if (!values[value][quad.predicate.value]) {
                values[value][quad.predicate.value] = [];
            }

            const info = {
                type: quad.object.termType,
                value: quad.object.value,
            };

            if (quad.object.termType === 'NamedNode' || quad.object.termType === 'BlankNode') {


                const subInfo = await getValues(quad.object.termType, quad.object.value, ds);
                const x = subInfo[quad.object.value];

                if (!_.isEmpty(x)) {
                    if (!info[quad.object.value]) {
                        info[quad.object.value] = []
                    }
                    info[quad.object.value].push(x);
                }
            }

            values[value][quad.predicate.value].push(info);
        }
    }

    return values;
}

export const editValue = async (nodeType, subject, predicate, objectType, object, newObject) => {

    const webId = await getWebId();

    const ds = await getSolidDataset(webId, {fetch: auth.fetch});

    let updatedDS = ds;

    for (const quad of ds) {

        if (quad.subject.termType === nodeType && quad.subject.value === subject && quad.predicate.value === predicate && quad.object.value === object) {

            const newQuads = DataFactory.quad(
                DataFactory.nodeType === 'BlankNode' ? DataFactory.blankNode(subject) : DataFactory.namedNode(subject),
                DataFactory.namedNode(predicate),
                objectType === "Literal" ? DataFactory.literal(newObject) : DataFactory.namedNode(newObject)
            );

            updatedDS = updatedDS.delete(quad);
            updatedDS = updatedDS.add(newQuads);
        }
    }

    await saveSolidDatasetAt(webId, updatedDS, { fetch: auth.fetch});

    // FIXME: workaround to preserve order and ttl structure
    const dummyURL = 'https://example.org/' + uuid();
    await data[webId][dummyURL].add('x');
    await data[webId][dummyURL].delete('x');
}


export const getInboxes = async () => {
    const webId = await getWebId();

    const card = await data[webId];

    const name = await card['foaf:name']
    const inbox = await card['http://www.w3.org/ns/ldp#inbox']

    const friendsArray = [{
        inbox: inbox.toString(),
        url: webId,
        name: name.toString()
    }]

    for await (const friend of card['http://xmlns.com/foaf/0.1/knows']) {
        const f = friend.toString()

        const name = await data[f]['foaf:name']
        const inbox = await data[f]['http://www.w3.org/ns/ldp#inbox']

        friendsArray.push({
            inbox: inbox.toString(),
            url: f,
            name: name.toString()
        })

    }

    return friendsArray;
}

export const getNotifications = async () => {
    const card = await data[await getWebId()]
    const inboxRDF = await card['http://www.w3.org/ns/ldp#inbox']
    const inbox = inboxRDF.toString();

    const inboxContainer = await data[inbox]

    const notifications = [];

    for await (const notificationURL of inboxContainer['http://www.w3.org/ns/ldp#contains']) {

        const notificationRDF = await data[notificationURL.toString()]

        const title = await notificationRDF['http://purl.org/dc/terms#title'];
        const summary = await notificationRDF['https://www.w3.org/ns/activitystreams#summary']
        const actor = await notificationRDF['https://www.w3.org/ns/activitystreams#actor']

        notifications.push({
            title: title ? title.toString() : "Untitled",
            text: summary ? summary.toString() : "No text",
            user: actor ? actor.toString() : "Unknown"
        })
    }

    return notifications;
}
