import {
    getSolidDataset,
    createSolidDataset,
    saveSolidDatasetAt,
    setStringNoLocale,
    getStringNoLocale,
    setThing,
    getThingAll,
    getThing,
    createThing,
    getNamedNodeAll
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

    const resource = 'https://jorge.pod.ideniox.com/ejemplo.ttl#jorge';

    const mD = await getSolidDataset(resource, {fetch: auth.fetch});

    const values = getThing(mD, resource) || createThing({url: resource});

    //const all = getThingAll(mD)
    // console.log(all)

    const has = getNamedNodeAll(values, 'https://example.org/has')

    console.log(has)


    //const newValues = setStringNoLocale(values, "https://example.org/enormes", "2");

    //const newMD = setThing(mD, newValues);

    //await saveSolidDatasetAt(resource, newMD, {fetch: auth.fetch});

};

