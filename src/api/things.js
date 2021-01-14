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

    const x = await data['https://jorge.pod.ideniox.com/profile/card#me']



    /*for await (const y of x['http://www.w3.org/ns/auth/acl#trustedApp']) {
        await y["foaf:name"].add("Permisos")
    }*/

}

