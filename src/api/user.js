import data from "@solid/query-ldflex";
import auth from "solid-auth-client";
import _ from 'lodash';

const getSession = async () => {
    return await auth.currentSession(localStorage);
};

export const getWebId = async () => {
    const session = await getSession();
    return session?.webId;
};

export const getValues = async (documentURI, path) => {
    try {
        const file = await data[documentURI];

        const values = [];

        // card#me a:b [c:d "x"]

        if (_.isEmpty(path)) return [];

        for await (const x of file[path]) {
            if (path === 'http://www.w3.org/ns/auth/acl#trustedApp') {

                const modes = []

                for await (const m of x["http://www.w3.org/ns/auth/acl#mode"]) {
                    modes.push(m)
                }

                const origin = await x["http://www.w3.org/ns/auth/acl#origin"];

                values.push({
                    mode: modes,
                    origin: origin.toString()
                })
            }
            else if (path === 'http://www.w3.org/2006/vcard/ns#hasAddress') {
                const country = await x['http://www.w3.org/2006/vcard/ns#country-name']
                const locality = await x['http://www.w3.org/2006/vcard/ns#locality']
                const zip = await x['http://www.w3.org/2006/vcard/ns#postal-code']
                const region = await x['http://www.w3.org/2006/vcard/ns#region']
                const address = await x['http://www.w3.org/2006/vcard/ns#street-address']

                values.push({
                    country: country.toString(),
                    locality: locality.toString(),
                    zip: zip.toString(),
                    region: region.toString(),
                    address: address.toString()
                })
            }
            else if (_.includes(['http://www.w3.org/2006/vcard/ns#hasTelephone', 'http://www.w3.org/2006/vcard/ns#hasEmail'], path)) {

                const value = await x['http://www.w3.org/2006/vcard/ns#value']
                const type = await x['http://www.w3.org/1999/02/22-rdf-syntax-ns#type']

                values.push({
                    value: value.toString(),
                    type: type.toString(),
                })
            }
            else {
                values.push(x.toString())
            }
        }

        return values;
    } catch (e) {
        console.error(e)
        return [];
    }
}



export const addValue = async (newValue, documentURI, path) => {
    console.log(documentURI)

    try {
        await data[documentURI][path].add(newValue);
    } catch (e) {
        console.error(e)
    }
}

export const removeValue = async (value, documentURI, path) => {
    await data[documentURI][path].delete(value);

}

export const getCard = async () => {
    const webId = await getWebId();

    const values = async (path, multi) => {
        return {
            values: await getValues(webId, path),
            multi,
        }
    };

    return {
        name: await values('foaf:name', false),
        image: await values('http://www.w3.org/2006/vcard/ns#hasPhoto', false),
        description: await values('foaf:description',false),
        friends: await values('foaf:knows', true),
        nicks: await values('foaf:nick', false),
        permissions: await values('http://www.w3.org/ns/auth/acl#trustedApp', true),
        address: await values('http://www.w3.org/2006/vcard/ns#hasAddress', true),
        email: await values('http://www.w3.org/2006/vcard/ns#hasEmail', true),
        phone: await values('http://www.w3.org/2006/vcard/ns#hasTelephone', true),
        notes: await values('http://www.w3.org/2006/vcard/ns#note', false),
        role: await values('http://www.w3.org/2006/vcard/ns#role', false),
        organization: await values('http://www.w3.org/2006/vcard/ns#organization-name', false),
    }
};
