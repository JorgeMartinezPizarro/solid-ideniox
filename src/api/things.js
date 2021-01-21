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
    removeThing, getBoolean, setBoolean,
} from "@inrupt/solid-client";
import _ from 'lodash';
import auth from "solid-auth-client";

import {removeFile} from './explore'

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

    const x = await getNotificationsFromFolder(inbox);
    const y = await getNotificationsFromFolder(inbox.replace('inbox', 'outbox'));

    return _.reverse(_.sortBy(_.concat(x, y), 'time'));

};

const getNotificationsFromFolder = async (inbox) => {
    const inboxDS = await getSolidDataset(inbox, {fetch: auth.fetch});

    const notifications = [];

    for await (const quad of inboxDS) {

        try {
            if (quad.predicate.value === 'http://www.w3.org/ns/ldp#contains') {
                const notificationDS = await getSolidDataset(quad.object.value, {fetch: auth.fetch});

                let title = '';
                let text = '';
                let user = '';
                let time = '';
                let read = '';
                let url = quad.object.value;

                for (const q of notificationDS) {

                    if (q.subject.value === quad.object.value && q.predicate.value === 'http://purl.org/dc/terms#title') {
                        title = q.object.value;
                    }
                    if (q.subject.value === quad.object.value && q.predicate.value === 'https://www.w3.org/ns/activitystreams#summary') {
                        text = q.object.value;
                    }
                    if (q.subject.value === quad.object.value && q.predicate.value === 'https://www.w3.org/ns/activitystreams#actor') {
                        user = q.object.value;
                    }
                    if (q.subject.value === quad.object.value && q.predicate.value === 'https://www.w3.org/ns/activitystreams#published') {
                        time = q.object.value;
                    }
                    if (q.subject.value === quad.object.value && q.predicate.value === 'https://www.w3.org/ns/solid/terms#read') {
                        read = q.object.value;
                    }

                }
                if (title && user && text && read && time && url)
                    notifications.push({
                        title,
                        text,
                        user,
                        read,
                        time,
                        url,
                        type: _.includes(inbox, 'inbox') ? 'inbox' : 'outbox',
                    });


            }
        } catch (e) { console.error(e)}
    }

    console.log(notifications)
    return _.reverse(_.sortBy(notifications, 'time'));
}

export const deleteNotification = async (notificationURL) => {
    await removeFile(notificationURL);
};

export const markNotificationAsRead = async (notificationURL) => {

    const ds = await getSolidDataset(notificationURL, {fetch: auth.fetch});


    const read = 'https://www.w3.org/ns/solid/terms#read';
    const boolean = 'http://www.w3.org/2001/XMLSchema#boolean';
    let updatedDS = ds;

    for (const quad of ds) {

        if (quad.subject.value === notificationURL && quad.predicate.value === read && quad.object.value === 'false') {

            const newQuad = DataFactory.quad(
                DataFactory.namedNode(notificationURL),
                DataFactory.namedNode(read),
                DataFactory.literal('true', DataFactory.namedNode(boolean))
            );

            console.log(newQuad)

            updatedDS = updatedDS.delete(quad);
            updatedDS = updatedDS.add(newQuad);
        }
    }

    try {
        await saveSolidDatasetAt(notificationURL, updatedDS, { fetch: auth.fetch});
    } catch (e) {console.error(e)}
}
