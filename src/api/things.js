import {
    getSolidDataset,
    saveSolidDatasetAt,
} from "@inrupt/solid-client";
import _ from 'lodash';
import auth from "solid-auth-client";

import {removeFile} from './explore'

import data from "@solid/query-ldflex";
import { v4 as uuid } from 'uuid';

import { DataFactory } from "n3";

import {getWebId} from "./user";

import * as N3 from 'n3';

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

export const getProfile = async () => {

    const webId = await getWebId();

    const ds = await getSolidDataset(webId, {fetch: auth.fetch});

    const values = await getValues('NamedNode', webId, ds)


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
    let photo = await card['http://www.w3.org/2006/vcard/ns#hasPhoto']
    if (!photo) photo = await card['http://xmlns.com/foaf/0.1/img'];


    const friendsArray = [{
        inbox: inbox.toString(),
        url: webId,
        name: name.toString(),
        photo: photo && photo.toString(),
    }]

    for await (const friend of card['http://xmlns.com/foaf/0.1/knows']) {
        const f = friend.toString()

        const name = await data[f]['foaf:name']
        const inbox = await data[f]['http://www.w3.org/ns/ldp#inbox']
        let photo = await data[f]['http://www.w3.org/2006/vcard/ns#hasPhoto']
        if (!photo) photo = await data[f]['http://xmlns.com/foaf/0.1/img'];

        friendsArray.push({
            inbox: inbox.toString(),
            url: f,
            name: name.toString(),
            photo: photo && photo.toString(),
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
                let destinatary = '';

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
                    if (q.subject.value === quad.object.value && q.predicate.value === 'https://example.org/destinatary') {
                        destinatary = q.object.value;
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
                        destinatary,
                        users: _.sortBy(_.concat([user], [destinatary])),
                        type: _.includes(inbox, 'inbox') ? 'inbox' : 'outbox',
                    });


            }
        } catch (e) { console.error(e)}
    }

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

            updatedDS = updatedDS.delete(quad);
            updatedDS = updatedDS.add(newQuad);
        }
    }

    try {
        await saveSolidDatasetAt(notificationURL, updatedDS, { fetch: auth.fetch});
    } catch (e) {console.error(e)}
}

export const sendNotification = async (text, title, destinatary, destinataryInbox, ) => {

    const boolean = 'http://www.w3.org/2001/XMLSchema#boolean';
    const sender = await getWebId()
    const card = await data[sender]
    const inboxRDF = await card['http://www.w3.org/ns/ldp#inbox']
    const inbox = inboxRDF.toString();

    const writer = new N3.Writer({
        format: 'text/turtle'
    });

    writer.addQuad(DataFactory.namedNode(''), DataFactory.namedNode('http://purl.org/dc/terms#title'), DataFactory.literal(title));
    writer.addQuad(DataFactory.namedNode(''), DataFactory.namedNode('https://www.w3.org/ns/activitystreams#summary'), DataFactory.literal(text));
    writer.addQuad(DataFactory.namedNode(''), DataFactory.namedNode('https://www.w3.org/ns/activitystreams#actor'), DataFactory.namedNode(sender));
    writer.addQuad(DataFactory.namedNode(''), DataFactory.namedNode('https://www.w3.org/ns/activitystreams#published'), DataFactory.literal(new Date().toISOString(), DataFactory.namedNode('http://www.w3.org/2001/XMLSchema#dateTime')));
    writer.addQuad(DataFactory.namedNode(''), DataFactory.namedNode('https://www.w3.org/ns/solid/terms#read'), DataFactory.literal('false', DataFactory.namedNode(boolean)));
    writer.addQuad(DataFactory.namedNode(''), DataFactory.namedNode('https://example.org/destinatary'), DataFactory.namedNode(destinatary));


    await writer.end(async (error, result) => {
        if (error) {
            throw error;
        }
        /**
         * Custom header options to create a notification file on pod.
         * options:
         * @slug: {String} custom file name that will be save it on the pod
         * @contentType: {String} format of the file that will be save it on the pod.
         */

        const fileName = uuid();

        const outbox = inbox.replace('inbox', 'outbox');

        await auth.fetch(destinataryInbox, {
            method: 'POST',
            body: result,
            headers: {
                'Content-Type': 'text/turtle',
                slug: fileName,
            }
        });

        await auth.fetch(outbox, {
            method: 'POST',
            body: result,
            headers: {
                'Content-Type': 'text/turtle',
                slug: fileName,
            }
        });
    });

};
