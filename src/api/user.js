import data from "@solid/query-ldflex";
import auth from "solid-auth-client";

const getSession = async () => {
    const session = await auth.currentSession(localStorage);
    return session;
};

export const getWebId = async () => {
    let session = await getSession();
    let webId = session.webId;
    return webId;
};

export const getValues = async (documentURI, path) => {
    try {
        const file = await data[documentURI];

        const vals = []

        for await (const x of file[path]) {
            vals.push(x.toString())
        }

        return vals;
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
    }

    return {
        name: await values('foaf:name', false),
        description: await values('foaf:description',false),
        friends: await values('foaf:knows', true),
        nicks: await values('foaf:nick', false),
    }
}
