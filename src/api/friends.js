import data from "@solid/query-ldflex";
import auth from "solid-auth-client";
import Cache from "./Cache";

const cache = new Cache();

const getSession = async () => {
    const session = await auth.currentSession(localStorage);

    return session;
};

export const getFriendData = async (webId) => {



    let friendData = {};

    let friend = await data[webId];
    friendData.fn = await friend.vcard_fn;

    friendData.url = await friend["solid:account"];

    if (friendData.url === undefined) {
        friendData.url = await friend['http://www.w3.org/2000/10/swap/pim/contact#preferredURI']
    } else {
        friendData.url += "profile/card#me";
    }
    friendData.image = `${await friend["vcard:hasPhoto"]}`;

    console.log(friendData.image)

    if (friendData.image === 'undefined')
        friendData.image = `${await friend["foaf:img"]}`;
    for await (const email of friend["vcard:hasEmail"]) {
        let mail = data[email];
        let value = await mail["vcard:value"];
        value = `${value}`;
        if (value !== undefined) {
            friendData.email = value.split(":")[1];
            break;
        }
    }
    friendData.friends = [];





    try {
        for await (const phone of friend['foaf:knows']) {
            if (phone !== undefined) {
                friendData.friends.push(phone);
            }
        }
    } catch (e) {}


    for await (const phone of friend["vcard:hasTelephone"]) {
        let pho = data[phone];
        let value = await pho["vcard:value"];
        value = `${value}`;
        if (value !== undefined) {
            friendData.phone = value.split(":")[1];
            break;
        }
    }

    friendData.name = `${await friend["foaf:name"]}`;
    friendData.company = `${await friend["vcard:organization-name"]}`;
    friendData.role = `${await friend["vcard:role"]}`;

    return friendData;
};

export const getWebId = async () => {
    let session = await getSession();
    let webId = session.webId;
    return webId;
};

export const getFriends = async (webId) => {
    const me = data[webId];
    let returnFriends = [];
    for await (const name of me.knows) {
        if (cache.contains(`${name}`)) {
            returnFriends.push(cache.get(`${name}`));
        } else {
            returnFriends.push(cache.add(`${name}`, await getFriendData(name)));
        }
    }
    return returnFriends;
};

export const addFriend = async (friendId) => {
    let me = data[await getWebId()];
    let friend = data[friendId];
    await me.knows.add(friend);
    cache.add(friendId, await getFriendData(friendId));
};

export const removeFriend = async (friendId) => {
    let me = data[await getWebId()];

    let friend = data[friendId];

    let friends = me["foaf:knows"];

    await friends.delete(friend);
    cache.remove(friendId);
};
