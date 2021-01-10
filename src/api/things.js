import {
    getSolidDataset,
    getThing,
    setThing,
    getStringNoLocale,
    setStringNoLocale,
    saveSolidDatasetAt
} from "@inrupt/solid-client";
import _ from 'lodash';
import auth from "solid-auth-client";
import { VCARD } from "@inrupt/vocab-common-rdf";


// To write to a profile, you must be authenticated. That is the role of the fetch
// parameter in the following call.
/*const getSession = async () => {
    const session = await auth.currentSession(localStorage);
    return session;
};*/


export const getResource = async (URI) => {




    console.log(auth, "WTF")
    //let webId = session.webId;

    try {

        const myProfileDataset = await getSolidDataset(URI, {
            fetch: auth.fetch,
        });

        const x = Array.from(myProfileDataset.quads)

        console.log(VCARD)

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
        console.error(e)
        return {
            error: e,
            values: [],
        };
    }
}


