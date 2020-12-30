import data from "@solid/query-ldflex";
import auth from "solid-auth-client";

const getSession = async () => {
    const session = await auth.currentSession(localStorage);
    return session;
};

export const getFriendData = async (webId) => {

    let friendData = {};
    let friend = data[webId];
    friendData.fn = await friend.vcard_fn;
    friendData.url = `${await friend["solid:account"]}`.concat("profile/card#");
    friendData.image = `${await friend["vcard:hasPhoto"]}`;
    for await (const email of friend["vcard:hasEmail"]) {
        let mail = data[email];
        let value = await mail["vcard:value"];
        value = `${value}`;
        if (value !== undefined) {
            friendData.email = value.split(":")[1];
            break;
        }
    }
    for await (const phone of friend["vcard:hasTelephone"]) {
        let pho = data[phone];
        let value = await pho["vcard:value"];
        value = `${value}`;
        if (value !== undefined) {
            friendData.phone = value.split(":")[1];
            break;
        }
    }

    friendData.company = `${await friend["vcard:organization-name"]}`;
    friendData.role = `${await friend["vcard:role"]}`;

    console.log(friendData)
    return friendData;
};

export const getWebId = async () => {
    let session = await getSession();
    let webId = session.webId;
    return webId;
};
