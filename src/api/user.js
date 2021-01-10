import data from "@solid/query-ldflex";
import auth from "solid-auth-client";
import Cache from "./Cache";

const cache = new Cache();

const getSession = async () => {
    const session = await auth.currentSession(localStorage);
    return session;
};

export const getWebId = async () => {
    let session = await getSession();
    let webId = session.webId;
    return webId;
};

export const getName = async () => {
    const webId = (await getSession()).webId;
    let userData = {};
    let me = await data[webId];

    const name = await me['foaf:name'];
    return name.toString()
}

export const setName = async newName => {
    await data.user.name.set(newName);
}

export const getProfile = async () => {

    const webId = (await getSession()).webId;

    let me = await data[webId];

    const name = await me['foaf:name'];
    const organization = await me['http://www.w3.org/2006/vcard/ns#organization-name'];
    const role = await me['http://www.w3.org/2006/vcard/ns#role'];
    const wtf = await me["https://cojon.es/grandes"]

    return {
        name: name.toString(),
        organization: organization.toString(),
        role: role.toString(),
        wtf: wtf.toString(),
    }
}

export const setWTF = async (newWTF) => {
    await data.user['https://cojon.es/grandes'].set(newWTF);
}

export const getWTF = async () => {
    const webId = (await getSession()).webId;

    let me = await data[webId];

    const nicks = await me["https://cojon.es/grandes"];
    return nicks || '';
};

export const getValue = async (documentURI, path) => {
    console.log("GETVALUE", documentURI, path)
    if (!documentURI || !path) return;
    console.log("CAGO")

    try {
        const file = await data[documentURI];

        const value = await file[path]


        return value && value.toString();
    } catch (e) {
        console.error(e)
        return ''
    }
}

export const setValue = async (newValue, documentURI, path) => {
    try {
        await data[documentURI][path].set(newValue)
    } catch (e) {
        console.error(e);
    }
}
