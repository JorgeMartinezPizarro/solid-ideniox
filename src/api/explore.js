import data from "@solid/query-ldflex";
import SolidFileClient from "solid-file-client";
import { fetch } from "@inrupt/solid-client-authn-browser";
import Cache from "./Cache";
let session = {}

let fc = undefined

export const setSession = (s) => {
    session = s;
    fc = new SolidFileClient(session);
}

const cache = new Cache();



export const getWebId = async () => {
    return session.info.webId;
};

export const getRoot = async () => {
    let me = data[await getWebId()];
    return `${await me["solid:account"]}`;
};

export const getFolder = async (folderUrl) => {

    let folderContent = await fc.readFolder(folderUrl);

    console.log(folderContent)

    const { name, parent, type, modified, size } = folderContent;

    let folder = {type, name, parent, folderUrl, content:[], size, modified};

    //load subfolders
    for (let subFolder of folderContent.folders) {
        const { name, parent, type, url } = subFolder;
        folder.content.push({type, name, parent, url, modified, size});
    }

    //load files

    for (let file of folderContent.files) {
        const { name, parent, type, url } = file;

        folder.content.push({type, name, parent, url, modified, size});
    }

    return folder;
};

export const readFile = async (fileUrl, ignoreCache = false) => {

    if (!ignoreCache) {
        const file = cache.get(fileUrl)
        if (file) return file
    }

    let fileContent = await fc.readFile(fileUrl);

    return cache.add(fileUrl, fileContent);
};


export const uploadFile = async (folder, filename, contentType, content) => {

    const url = buildFileUrl(folder, filename)
    cache.remove(url)
    cache.add(url, content)

    const type = filename.endsWith('.ttl')
        ? 'text/turtle'
        : contentType;


    return await fc.putFile(url, content, type);
};

const buildFileUrl = (path, fileName) => {
    return `${path.concat(fileName)}`;
};

export const removeFile = async (uri) => {
    try {
        await fc.delete(uri);
        return {};
    } catch (e) {
        return {
            error: {...e}
        }
    }
};

export const createFolder = async (uri) => {
    if (uri.endsWith('.ttl')) {
        return await fc.createFile(uri, '', 'text/turtle');
    }
    if (uri.endsWith('.txt')) {
        return await fc.createFile(uri, '', 'text/plain');
    }
    if (uri.endsWith('.rdf')) {
        return await fc.createFile(uri, '', 'text/plain');
    }

    try {
        await fc.createFolder(uri);
    } catch (e) {
        console.error(e)
    }
};

export const rename = async (uriFrom,uriTo) => {
    await fc.move(uriFrom,uriTo);
};
