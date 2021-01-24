import {
    getSolidDataset,
    saveSolidDatasetAt,
} from "@inrupt/solid-client";
import _ from 'lodash';
import auth from "solid-auth-client";

import md5 from 'md5';

import {removeFile, createFolder, uploadFile} from './explore'

import data from "@solid/query-ldflex";
import { v4 as uuid } from 'uuid';

import { DataFactory } from "n3";

import {getWebId} from "./user";

import * as N3 from 'n3';

String.prototype.hexDecode = function(){
    var j;
    var hexes = this.match(/.{1,4}/g) || [];
    var back = "";
    for(j = 0; j<hexes.length; j++) {
        back += String.fromCharCode(parseInt(hexes[j], 16));
    }

    return back;
}

String.prototype.hexEncode = function(){
    var hex, i;

    var result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }

    return result
}

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


    let a = [];

    for await (const friend of card['foaf:knows']) {
        console.log(inbox+md5(friend.toString()))
        const x = await getNotificationsFromFolder(inbox+md5(friend.toString())+'/', friend.toString());
        a = _.concat(x, a);
    }

    const y = await getNotificationsFromFolder(inbox.replace('inbox', 'outbox'), await getWebId());

    return _.reverse(_.sortBy(_.concat(a, y), 'time'));
};

const getNotificationsFromFolder = async (inbox, sender) => {
    const inboxDS = await getSolidDataset(inbox, {fetch: auth.fetch});
    console.log("XXX", sender)
    const notifications = [];
    let latest = ''
    for await (const quad of inboxDS) {

        try {
            if (quad.predicate.value === 'http://www.w3.org/ns/ldp#contains') {
                console.log(quad.object.value)
                const notificationDS = await getSolidDataset(quad.object.value, {fetch: auth.fetch});

                latest = quad.object.value;

                let title = '';
                let text = '';
                let time = '';
                let read = '';
                let url = quad.object.value;
                let addressee = '';

                for (const q of notificationDS) {

                    if (q.subject.value === quad.object.value && q.predicate.value === 'http://purl.org/dc/terms#title') {
                        title = q.object.value;
                    }
                    if (q.subject.value === quad.object.value && q.predicate.value === 'https://www.w3.org/ns/activitystreams#summary') {
                        text = q.object.value;
                    }
                    if (q.subject.value === quad.object.value && q.predicate.value === 'https://www.w3.org/ns/activitystreams#published') {
                        time = q.object.value;
                    }
                    if (q.subject.value === quad.object.value && q.predicate.value === 'https://www.w3.org/ns/activitystreams#addressee') {
                        addressee = q.object.value;
                    }
                    if (q.subject.value === quad.object.value && q.predicate.value === 'https://www.w3.org/ns/solid/terms#read') {
                        read = q.object.value;
                    }
                }
                if (title && text && read && time && url) {
                    notifications.push({
                        title,
                        text,
                        user: sender,
                        read,
                        time,
                        url,
                        addressee,
                        users: _.sortBy(_.concat([sender], [addressee])),
                        type: _.includes(inbox, 'inbox') ? 'inbox' : 'outbox',
                    });
                } else {
                    console.log(title, text, read, time, url)
                }


            }
        } catch (e) { console.error(latest, e)}
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

export const sendNotification = async (text, title, addressee, destinataryInbox, ) => {

    const boolean = 'http://www.w3.org/2001/XMLSchema#boolean';
    const sender = await getWebId()
    const card = await data[sender]
    const inboxRDF = await card['http://www.w3.org/ns/ldp#inbox']
    const inbox = inboxRDF.toString();

    const writer = new N3.Writer({
        format: 'text/turtle'
    });

    const result = `
        <> <http://purl.org/dc/terms#title> "${title}" . 
        <> <https://www.w3.org/ns/activitystreams#summary> "${text}".
        <> <https://www.w3.org/ns/solid/terms#read> "false"^^<${boolean}> .
        <> <https://www.w3.org/ns/activitystreams#published> "${new Date().toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
        <> <https://www.w3.org/ns/activitystreams#addressee> <${addressee}> . 
    `;

    const fileName = uuid();

    const outbox = inbox.replace('inbox', 'outbox');

    if (addressee !== sender) {

        const x = await auth.fetch(destinataryInbox + md5(sender), {
            method: 'POST',
            body: result,
            headers: {
                'Content-Type': 'text/turtle',
                slug: fileName,
            }
        });

        if (x.status === 403) {
            console.log('skip outbox, error sending!!!!!')
            return {
                message: 'Not authorized'
            };
        }
    }

    const y = await auth.fetch(outbox, {
        method: 'POST',
        body: result,
        headers: {
            'Content-Type': 'text/turtle',
            slug: fileName,
        }
    })
    return {}

};


export const createFriendsDir = async () => {
    const id = await getWebId();
    const card = data[id];

    for await (const friend of card['foaf:knows']) {

        await createFriendDir(friend.toString())
    }
}

const createFriendDir = async (userID) => {
    const id = await getWebId();
    const card = await data[id]
    const inboxRDF = await card['http://www.w3.org/ns/ldp#inbox']
    const inbox = inboxRDF.toString();
    const folder = inbox+ md5(userID)+'/';

    const ACL = `
        
# ACL resource for the profile Inbox

@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

<#owner>
    a acl:Authorization;

    acl:agent
        <${id}>;

    acl:accessTo <./>;
    acl:default <./>;

    acl:mode
        acl:Read, acl:Write, acl:Control.

# Public-appendable but NOT public-readable
<#public>
    a acl:Authorization;

    acl:agentClass foaf:Agent;  # everyone

    acl:accessTo <./>;

    acl:mode acl:Append.

<#editor>
    a acl:Authorization;

    acl:agent <${userID}>;

    acl:accessTo <./>;

    acl:mode acl:Append.
  
    
    `;


    try {
        await createFolder(folder);
        await uploadFile(folder, '.acl', 'text/turtle', ACL);
    } catch (e) {
        console.error(e)
    }
}
