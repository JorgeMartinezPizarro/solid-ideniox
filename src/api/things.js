import {
    getSolidDataset,
    saveSolidDatasetAt,
} from "@inrupt/solid-client";
import _ from 'lodash';

import md5 from 'md5';

import * as $rdf from 'rdflib';

import {getWebId, removeFile, createFolder, uploadFile, readFile, setSession as setExploreSession} from './explore'


import data from "@solid/query-ldflex";

import { v4 as uuid } from 'uuid';
import { DataFactory } from "n3";

let session = {}

export const setSession = (s) => {
    console.log("XXX", s)
    session = s;
    setExploreSession(s);
}

export const getProfile = async () => {

    const webId = await getWebId();

    const ds = await getSolidDataset(webId, {fetch: session.fetch});

    return await getValues('NamedNode', webId, ds)
};


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


                const subInfo = quad.object.value === await getWebId()
                    ? []
                    : await getValues(quad.object.termType, quad.object.value, ds);
                const x = subInfo[quad.object.value];

                if (!_.isEmpty(x)) {
                    if (!info[quad.object.value]) {
                        info[quad.object.value] = []
                    }
                    info.node = quad.object;
                    if (quad.object.termType === 'BlankNode' && x['http://www.w3.org/ns/auth/acl#origin']) {
                        info.origin = x['http://www.w3.org/ns/auth/acl#origin'][0].value;
                    }
                    info[quad.object.value].push(x);
                }
            }

            values[value][quad.predicate.value].push(info);
        }
    }

    return values;
}

export const deleteNode = async (node, origin) => {
    const webId = await getWebId();

    const ds = await getSolidDataset(webId, {fetch: session.fetch});

    let updatedDS = ds;

    let blankNode;

    for (const quad of ds) {

        if (_.isEqual(quad.subject, node) || _.isEqual(quad.object, node)) {
            updatedDS = updatedDS.delete(quad)
        }
        else if (origin === quad.object.value) {
            blankNode = quad.subject;
        }
    }

    if (blankNode) {
        for (const quad of ds) {

            if (_.isEqual(quad.subject, blankNode) || _.isEqual(quad.object, blankNode)) {
                updatedDS = updatedDS.delete(quad)
            }
        }
    }

    await saveSolidDatasetAt(webId, updatedDS, { fetch: session.fetch});
}

export const deleteValue = async (nodeType, subject, predicate, objectType, newObject) => {

    const webId = await getWebId();

    const ds = await getSolidDataset(webId, {fetch: session.fetch});

    let updatedDS = ds.delete(
        DataFactory.quad(
            nodeType === 'BlankNode' ? DataFactory.blankNode(subject) : DataFactory.namedNode(subject),
            DataFactory.namedNode(predicate),
            objectType === "Literal" ? DataFactory.literal(newObject) : DataFactory.namedNode(newObject)
        )
    );

    await saveSolidDatasetAt(webId, updatedDS, { fetch: session.fetch});

    // FIXME: workaround to preserve order and ttl structure

}

export const addTrustedApp = async (read, write, append, control, origin) => {

    const webId = await getWebId();

    const ds = await getSolidDataset(webId, {fetch: session.fetch});


    const b = DataFactory.blankNode();

    let updatedDS = ds.add(
        DataFactory.quad(
            DataFactory.namedNode(webId),
            DataFactory.namedNode('http://www.w3.org/ns/auth/acl#trustedApp'),
            b
        )
    )

    updatedDS = updatedDS.add(
        DataFactory.quad(
            b,
            DataFactory.namedNode('http://www.w3.org/ns/auth/acl#origin'),
            DataFactory.namedNode(origin)
        )
    );

    if (read)
        updatedDS = updatedDS.add(
            DataFactory.quad(
                b,
                DataFactory.namedNode('http://www.w3.org/ns/auth/acl#mode'),
                DataFactory.namedNode('http://www.w3.org/ns/auth/acl#Read')
            )
        );
    if (write)
        updatedDS = updatedDS.add(
            DataFactory.quad(
                b,
                DataFactory.namedNode('http://www.w3.org/ns/auth/acl#mode'),
                DataFactory.namedNode('http://www.w3.org/ns/auth/acl#Write')
            )
        );
    if (append)
        updatedDS = updatedDS.add(
            DataFactory.quad(
                b,
                DataFactory.namedNode('http://www.w3.org/ns/auth/acl#mode'),
                DataFactory.namedNode('http://www.w3.org/ns/auth/acl#Append')
            )
        );
    if (control)
        updatedDS = updatedDS.add(
            DataFactory.quad(
                b,
                DataFactory.namedNode('http://www.w3.org/ns/auth/acl#mode'),
                DataFactory.namedNode('http://www.w3.org/ns/auth/acl#Control')
            )
        );

    await saveSolidDatasetAt(webId, updatedDS, { fetch: session.fetch});

    // FIXME: workaround to preserve order and ttl structure

}



export const addValue = async (nodeType, subject, predicate, objectType, newObject) => {

    const webId = await getWebId();

    const ds = await getSolidDataset(webId, {fetch: session.fetch});

    let updatedDS = ds.add(
        DataFactory.quad(
            nodeType === 'BlankNode' ? DataFactory.blankNode(subject) : DataFactory.namedNode(subject),
            DataFactory.namedNode(predicate),
            objectType === "Literal" ? DataFactory.literal(newObject) :
                objectType === 'BlankNode'
                    ? DataFactory.blankNode(newObject)
                    : DataFactory.namedNode(newObject)
        )
    );

    await saveSolidDatasetAt(webId, updatedDS, { fetch: session.fetch});

    // FIXME: workaround to preserve order and ttl structure

}

export const editValue = async (nodeType, subject, predicate, objectType, object, newObject) => {

    const webId = await getWebId();

    const ds = await getSolidDataset(webId, {fetch: session.fetch});

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

    await saveSolidDatasetAt(webId, updatedDS, { fetch: session.fetch});

    // FIXME: workaround to preserve order and ttl structure
    const dummyURL = 'https://example.org/'
    await data[webId][dummyURL].add('x');
    await data[webId][dummyURL].delete('x');

}


export const getInboxes = async () => {

    const start = Date.now();

    const webId = await getWebId();

    console.log(session)

    const ds = await getSolidDataset(webId, {fetch: session.fetch});

    let name = ''
    let photo = ''

    const friendsArray = []
    console.log(ds, webId)
    for (const quad of ds) {
        if (quad.subject.value === webId && quad.predicate.value === 'http://xmlns.com/foaf/0.1/name') {
            name = quad.object.value;

        } else if (quad.subject.value === webId && quad.predicate.value === 'http://www.w3.org/2006/vcard/ns#hasPhoto') {
            photo = quad.object.value;

        } else if (quad.subject.value === webId && quad.predicate.value === 'http://xmlns.com/foaf/0.1/knows') {
            try{
                const f = quad.object.value
                const name = await data[f]['foaf:name']
                const inbox = f.replace('/profile/card#me','') + '/pr8/'
                let photo = await data[f]['http://www.w3.org/2006/vcard/ns#hasPhoto']
                if (!photo) photo = await data[f]['http://xmlns.com/foaf/0.1/img'];

                friendsArray.push({
                    inbox: inbox.toString(),
                    url: f,
                    name: name.toString(),
                    photo: photo && photo.toString(),
                })
            } catch (e) {
                console.error(e)
            }
        }
    }

    friendsArray.push({
        inbox: webId.replace('/profile/card#me','') + '/pr8/sent/',
        url: webId,
        name: name,
        photo: photo,
    })

    console.log("Pr8 Load friends in " + (Date.now() - start)/1000 + " s")

    return friendsArray
}


export const readCache = async () => {

    const id = await getWebId()

    const url = id.replace('/profile/card#me','') + '/pr8/cache';

    const a = Date.now();
    const store = $rdf.graph();
    const fetcher = $rdf.fetcher(store,{fetch: session.fetch})
    await fetcher.load(url);

    const notifications = {}

    for (const quad of store.statements) {
        if (!notifications[quad.subject.value]) notifications[quad.subject.value] = {}
        if (!notifications[quad.subject.value][quad.predicate.value]) notifications[quad.subject.value][quad.predicate.value] = []
        notifications[quad.subject.value][quad.predicate.value].push(quad.object.value)
    }

    const n = [];

    _.forEach(notifications, (notification, key) => {

        if (!notification["https://www.w3.org/ns/activitystreams#addressee"]) {
            return;
        }

        const users = [
            ...notification["https://www.w3.org/ns/activitystreams#addressee"],
            notification["https://example.org/sender"][0]
        ].sort()

        n.push({
            url: key,
            text: notification["https://www.w3.org/ns/activitystreams#summary"][0],
            title: notification["http://purl.org/dc/terms#title"][0],
            time: notification["https://www.w3.org/ns/activitystreams#published"][0],
            read: notification["https://www.w3.org/ns/solid/terms#read"][0] === "1",
            attachments: notification["https://example.org/hasAttachment"] || [],
            links: notification["https://example.org/hasLink"] || [],
            addressees: notification["https://www.w3.org/ns/activitystreams#addressee"],
            groupImage: notification["https://example.org/groupImage"] ? notification["https://example.org/groupImage"][0] : undefined,
            groupTitle: notification["https://example.org/groupTitle"] ? notification["https://example.org/groupTitle"][0] : undefined,
            user: notification["https://example.org/sender"][0],
            users
        });
    });

    console.log("Pr8 Load " + n.length + " notifications from cache in " + (Date.now() - a )/1000 + " s")

    return n;
};

export const getNotifications = async (exclude = 0, folder = []) => {
    const start = Date.now();
    const id = await getWebId()
    const card = await data[await getWebId()]
    let cached = [];

    if (exclude === 0) {
        try {

        } catch (e) {

        }
    }

    let a = [];
    let count = 0;
    for await (const friend of card['foaf:knows']) {
        const f = id.replace('/profile/card#me','') + '/pr8/' + md5(friend.toString())+'/'
        if (_.isEmpty(folder) || _.includes(folder, f)) {

            try {

                const x = await getNotificationsFromFolder(f, friend.toString(), 0);
                count++;
                a = _.concat(x, a);

            } catch (e) {}
        }
    }

    const f = id.replace('/profile/card#me','') + '/pr8/sent/' ;
    let y = []
    try {
        if (_.isEmpty(folder) || _.includes(folder, f)) {
            y = await getNotificationsFromFolder(f, await getWebId(), 0)
            count++
        }
    } catch (e) {}

    const z = _.reverse(_.sortBy(_.concat(a, y), 'time'));

    const notifications = _.concat(cached, z);

    const t = _.uniqBy(_.reverse(_.sortBy(notifications, 'time')), 'url');

    console.log("Pr8 Load " + t.length + " new notifications from " + count + " folders in " + (Date.now() - start)/1000 + ' s')

    return t;
};

export const existOutbox = async () => {
    try {
        const id = await getWebId();
        await readFile(id.replace('/profile/card#me','') + '/pr8')
        await readFile(id.replace('/profile/card#me','') + '/pr8/sent')
        return true;
    } catch (e) {
        return false;
    }
}

export const createOutbox = async () => {
    try {
        const id = await getWebId();
        await createFolder(id.replace('/profile/card#me','') + '/pr8')
        await createFolder(id.replace('/profile/card#me','') + '/pr8/sent')
        return true;
    } catch (e) {
        return false;
    }
}

export const existFriendFolder = async (userID) => {

    const id = await getWebId();
    const folder = id.replace('/profile/card#me','') +'/pr8/' + md5(userID)+'/';

    try {
        await readFile(folder);
        return true;
    } catch (e) {
        return false;
    }

}

const getNotificationsFromFolder = async (inbox, sender, excludes) => {
    let inboxDS;
    try {
        inboxDS = await getSolidDataset(inbox, {fetch: session.fetch});
    } catch(e) {return []}

    const notifications = [];

    for await (const quad of inboxDS) {

        try {

            const b = _.last(quad.subject.value.split('/'));
            if (quad.predicate.value === 'http://www.w3.org/ns/posix/stat#mtime' && b.length === 40) {

                const notificationDS = await getSolidDataset(quad.subject.value, {fetch: session.fetch});

                let title = '';
                let text = '';
                let time = '';
                let read = '';
                let url = quad.subject.value;
                let addressees = [];
                let groupTitle = '';
                let groupImage = '';

                const attachments = [];
                const links = [];

                for (const q of notificationDS) {

                    if (q.subject.value === quad.subject.value && q.predicate.value === 'http://purl.org/dc/terms#title') {
                        title = q.object.value;
                    }
                    if (q.subject.value === quad.subject.value && q.predicate.value === 'https://www.w3.org/ns/activitystreams#summary') {
                        text = q.object.value;
                    }
                    if (q.subject.value === quad.subject.value && q.predicate.value === 'https://www.w3.org/ns/activitystreams#published') {
                        time = q.object.value;
                    }
                    if (q.subject.value === quad.subject.value && q.predicate.value === 'https://www.w3.org/ns/activitystreams#addressee') {
                        addressees.push(q.object.value);
                    }
                    if (q.subject.value === quad.subject.value && q.predicate.value === 'https://www.w3.org/ns/solid/terms#read') {
                        read = q.object.value;
                    }
                    if (q.subject.value === quad.subject.value && q.predicate.value === 'https://example.org/hasAttachment') {
                        attachments.push(q.object.value);
                    }
                    if (q.subject.value === quad.subject.value && q.predicate.value === 'https://example.org/hasLink') {
                        links.push(q.object.value);
                    }
                    if (q.subject.value === quad.subject.value && q.predicate.value === 'https://example.org/groupImage') {
                        groupImage = q.object.value;
                    }
                    if (q.subject.value === quad.subject.value && q.predicate.value === 'https://example.org/groupTitle') {
                        groupTitle = q.object.value;
                    }
                }
                if (title && read && time && url) {

                    const users = _.sortBy(_.concat([sender], addressees));

                    const n = {
                        text,
                        title,
                        user: sender,
                        read: read === "true",
                        time,
                        url,
                        addressees,
                        users,
                        attachments,
                        links,
                        groupTitle,
                        groupImage
                    }

                    notifications.push(n);
                } else {
                    console.log("WTF", title, read, time, url)
                }
            }
        } catch (e) { }
    }

    return _.reverse(_.sortBy(notifications, 'time'));
}

const notificationToRDF = notification => {
    let content3 = `<${notification.url}> 
    <https://www.w3.org/ns/activitystreams#summary> """${notification.text}""";
    <https://www.w3.org/ns/activitystreams#published> "${notification.time}"^^<http://www.w3.org/2001/XMLSchema#dateTime>;
    <https://www.w3.org/ns/solid/terms#read> ${notification.read};
    <https://example.org/sender> <${notification.user}>;
`
    _.forEach(notification.attachments,attachment=>{
        content3 += `    <https://example.org/hasAttachment> <${attachment}>;
`
    }).join("\n    ")
    _.forEach(notification.links,link=>{
        content3 += `    <https://example.org/hasLink> <${link}>;
`
    }).join("\n    ")
    _.forEach(notification.addressees,addressee=>{
        content3 += `    <https://www.w3.org/ns/activitystreams#addressee> <${addressee}>;
`
    }).join("\n    ")
    if (notification.groupImage)
        content3 += `    <https://example.org/groupImage> <${notification.groupImage}>;
`
    if (notification.groupTitle)
        content3 += `    <https://example.org/groupTitle> """${notification.groupTitle}""";
`
    content3 += `    <http://purl.org/dc/terms#title> """${notification.title}""".
`
    return content3
}

export const setCache = async (delta = [], action = '') => {

    const id = (await getWebId()).replace('/profile/card#me','')

    if (_.isEmpty(delta)) return;

    const queries = []

    switch (action) {
        case "add":

            for (let i=0, j=delta.length; i<j; i+=150) {
                const x = delta.slice(i,i+150);
                queries.push(`
INSERT DATA { 
    ${x.map(notificationToRDF).join("\n")} 
}
                `);
                // do whatever
            }


            break;

        case 'delete':
            for (let i=0, j=delta.length; i<j; i+=150) {
                const x = delta.slice(i, i + 150);
                queries.push(`
        
                DELETE DATA { 
                    ${x.map(notificationToRDF).join("\n")}
    }
                
                `);
            }
            break;

        case  'modify':

            for (let i=0, j=delta.length; i<j; i+=150) {
                const x = delta.slice(i, i + 150);

                const deletes = x.map(n => `<${n.url}> <https://www.w3.org/ns/solid/terms#read> false.\n`).join("\n")

                const inserts = x.map(n => `<${n.url}> <https://www.w3.org/ns/solid/terms#read> true.\n`).join("\n")
                queries.push(`
                    DELETE DATA {
                        ${deletes}
                    }                
                    INSERT DATA {
                        ${inserts}                
                    }
                `);
            }
    }

    for (const query of queries) {
        await session.fetch(id+'/pr8/cache', {
            method: 'PATCH',
            body: query,
            headers: {
                'Content-Type': 'application/sparql-update',
            }
        });
    }

}
export const deleteNotification = async (attachments) => {

    await _.forEach(attachments, async attachment => {
        await removeFile(attachment);
    });

};

export const sendNotification = async (text, title, json, files, links =[], groupImage ='', groupTitle = '') => {

    if (title === 'xxx' && json.length > 1) {
        throw new Error("WTF SENDING MULTIPLE USERS A XXX MESSAGE")
    }

    const boolean = 'http://www.w3.org/2001/XMLSchema#boolean';
    const sender = await getWebId()
    const card = await data[sender]
    const attachments = [];
    const inboxRDF = await card['http://www.w3.org/ns/ldp#inbox']
    const inbox = inboxRDF.toString();
    const fileName = uuid();
    let filesRDF = {};
    let filesRDF2 = '';
    const outbox = inbox.replace('inbox', 'pr8/sent');
    for(let i=0;i<files.length;i++){

        const f = fileName + '-' + encodeURIComponent(files[i].name);
        const content = files[i];

        _.forEach(json, async j => {
            const addressee = j.url
            const destinataryInbox = j.inbox

            if (sender !== addressee) {
                await session.fetch(destinataryInbox + md5(sender) + '/', {
                    method: 'POST',
                    body: content,
                    headers: {
                        'Content-Type': files[i].type || 'text/turtle',
                        slug: f.replace(".jpg", ".jpeg"),
                    }
                });
            }
        })

        await session.fetch(outbox, {
            method: 'POST',
            body: content,
            headers: {
                'Content-Type': files[i].type || 'text/turtle',
                slug: f.replace(".jpg", ".jpeg"),
            }
        });

        _.forEach(json, j => {
            const addressee = j.url
            const destinataryInbox = j.inbox
            if (!filesRDF[addressee]) filesRDF[addressee] = '';
            filesRDF[addressee] = `${filesRDF[addressee]}
            <> <https://example.org/hasAttachment> <${destinataryInbox + md5(sender) + '/' + f.replace(".jpg", ".jpeg")}> .`
        })
        filesRDF2 = `${filesRDF2}
        <> <https://example.org/hasAttachment> <${outbox + f.replace(".jpg", ".jpeg")}> .`
        attachments.push(outbox + f.replace(".jpg", ".jpeg"))
    }

    for(let i=0;i<links.length;i++){
        const url = links[i]

        _.forEach(json, j => {
            const addressee = j.url
            const destinataryInbox = j.inbox
            if (!filesRDF[addressee]) filesRDF[addressee] = '';
            filesRDF[addressee] = `${filesRDF[addressee]}
            <> <https://example.org/hasLink> <${url}> .`
        })
        filesRDF2 = `${filesRDF2}
        <> <https://example.org/hasLink> <${url}> .`
    }

    const totalUsers = json.map(j => j.url)
    //totalUsers.push(await getWebId())

    const result = (files, read) => `
            <> <http://purl.org/dc/terms#title> """${title}""" .
            ${groupImage ? `<> <https://example.org/groupImage> <${groupImage}> .` : ``}
            ${groupTitle ? `<> <https://example.org/groupTitle> """${groupTitle}""" .` : ``}
            <> <https://www.w3.org/ns/activitystreams#summary> """${text}""".
            <> <https://www.w3.org/ns/solid/terms#read> "${read}"^^<${boolean}> .
            <> <https://www.w3.org/ns/activitystreams#published> "${new Date().toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
            ${totalUsers.map(user => `<> <https://www.w3.org/ns/activitystreams#addressee> <${user}> .`).join('\n')}
            ${files||''}
        `;

    _.forEach(json, async j => {

        const addressee = j.url
        const destinataryInbox = j.inbox



        if (addressee !== sender) {

            const x = await session.fetch(destinataryInbox + md5(sender) + '/', {
                method: 'POST',
                body: result(filesRDF[addressee], false),
                headers: {
                    'Content-Type': 'text/turtle',
                    slug: fileName,
                }
            });

            // FIXME: break and return!
            if (x.status === 403 || x.status === 401 || x.status === 404) {
                return {
                    message: 'The user must be your friend and click on start a chat with you.'
                };
            }

            await session.fetch(destinataryInbox + md5(sender) + '/log.txt', {
                method: 'PUT',
                body: '' + uuid() + '',
                headers: {
                    'Content-Type': 'text/plain',
                }
            });
        }
    })

    // TODO: write output message


    await session.fetch(outbox, {
        method: 'POST',
        body: result(filesRDF2, true),
        headers: {
            'Content-Type': 'text/turtle',
            slug: fileName,
        }
    });

    const addressees = json.map(i => i.url)
    const time = new Date().toISOString()
    const url = outbox + fileName + '.ttl';

    const users = _.cloneDeep(addressees);
    users.push(sender)

    return {
        text,
        title,
        user: sender,
        read: 'true',
        time,
        url,
        addressees,
        users,
        type: _.includes(inbox, 'inbox') ? 'inbox' : 'outbox',
        attachments,
        links,
        groupTitle,
        groupImage
    };
};

export const createFriendDir = async (userID) => {
    const id = await getWebId();
    const card = await data[id]
    const inboxRDF = await card['http://www.w3.org/ns/ldp#inbox']
    const inbox = inboxRDF.toString();
    const folder = id.replace('/profile/card#me','/pr8/') + md5(userID)+'/';

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

# Private appendable
<#editor>
    a acl:Authorization;

    acl:agent <${userID}>;

    acl:accessTo <./>;

    acl:mode acl:Append.
    `;

    const AC2 = `

# ACL resource for the profile Inbox

@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

<#owner>
    a acl:Authorization;

    acl:agent
        <${id}>;

    acl:accessTo <./log.txt>;

    acl:mode
        acl:Read, acl:Write, acl:Control.

# Private appendable
<#editor>
    a acl:Authorization;

    acl:agent <${userID}>;

    acl:accessTo <./log.txt>;

    acl:mode acl:Write, acl:Read, acl:Control, acl:Append .
    `;




    try {
        await createFolder(folder);
        await uploadFile(folder, 'log.txt', 'text/plain', ''+uuid()+'');
        await uploadFile(folder, 'log.txt.acl', 'text/turtle', AC2);
        await uploadFile(folder, '.acl', 'text/turtle', ACL);
    } catch (e) {
        console.error(e)
    }
}

export const shareFile = async (url,userID) => {
    let aclUrl = url + '.acl'
    let sharedFileACL;
    const aux2 = aclUrl.split('/').pop()
    const aux = aclUrl.split('/')
    aux.pop()
    const aux3 = url.split('/').pop()
    try {
       sharedFileACL = await readFile(aclUrl);
    } catch (e) {
        sharedFileACL =
        `
        @prefix acl: <http://www.w3.org/ns/auth/acl#>.
        @prefix foaf: <http://xmlns.com/foaf/0.1/>.
        
        <#owner>
        a acl:Authorization;

        acl:agent
        <${await getWebId()}>;

        acl:accessTo <./${aux3}>;

        acl:mode
        acl:Read, acl:Write, acl:Control.
        `
    }

    sharedFileACL +=
    `#Share permissions for ${userID}
    <#editor>
    a acl:Authorization;

    acl:agent <${userID}>;

    acl:accessTo <./${aux3}>;

    acl:mode acl:Write, acl:Read, acl:Control, acl:Append .
    `;


    await uploadFile(aux.join('/')+'/', aux2, 'text/turtle', sharedFileACL);

}

export const uploadGroupImage = async (image) => {
    const name = md5(image + Date.now())+ '-'+ encodeURIComponent(image[0].name)
    const id = await getWebId()
    const folder = id.replace('/profile/card#me', '/profile/')
    // TODO: upload file and add ACL for the members of the group
    await session.fetch(folder, {
        method: 'POST',
        body: image[0],
        headers: {
            'Content-Type': image[0].type,
            slug: name,
        }
    });

    return folder + name
}

export const cleanupFolders = async () => {

    const id = await getWebId()

    const pr8 = id.replace("/profile/card#me", "/pr8/")

    const card = await getSolidDataset(id, {fetch: session.fetch});
    const pr8Folder = await getSolidDataset(pr8, {fetch: session.fetch});

    const x = 32 + pr8.length + 1;

    const friends = [];
    for (const quad of card) {
        if (quad.subject.value === id && quad.predicate.value === 'http://xmlns.com/foaf/0.1/knows') {
            friends.push(quad.object.value)
        }
    }

    for (const quad of pr8Folder) {
        if (quad.predicate.value === "http://www.w3.org/ns/ldp#contains" && quad.object.value.length === x) {
            if (
                _.find(friends, friend => pr8 + md5(friend) + "/" === quad.object.value)
            ) {

            } else {
                console.log("Pr8 Load deletable folder ", quad.object.value)
                await removeFile(quad.object.value + ".acl")
            }
        }
    }
}
