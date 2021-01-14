import {
    getSolidDataset,
} from "@inrupt/solid-client";
import _ from 'lodash';
import auth from "solid-auth-client";
import data from "@solid/query-ldflex";

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

export const doSomething = async () => {

    const x = await data['https://jorge.pod.ideniox.com/profile/card#me'];

    const t = await data['https://jorge.pod.ideniox.com/profile/card#me']['http://www.w3.org/ns/auth/acl#trustedApp']

    console.log(t.toString());

    // that works for nested values if values are not blank nodes
    for await (const y of x['http://www.w3.org/ns/auth/acl#trustedApp']) {

        const origin = (await y['http://www.w3.org/ns/auth/acl#origin']).toString();

        console.log(
            await y.toString(),
            'http://www.w3.org/ns/auth/acl#origin',
            origin,
        );

        if (origin === 'https://solidcommunity.net') {
            await y['http://www.w3.org/ns/auth/acl#origin'].delete(origin);
        }
    }
};

