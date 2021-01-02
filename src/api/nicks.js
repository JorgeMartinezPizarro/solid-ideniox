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

export const getNicks = async () => {
    const webId = (await getSession()).webId;
    let userData = {};
    let me = await data[webId];
    const nicks = []
    for await (const phone of me["foaf:nick"]) {

        if (phone !== undefined) {
            nicks.push(phone);
        }
    }
    return nicks;
};

export const addNick = async (newNick) => {
    await data.user.nick.add(newNick);
};


