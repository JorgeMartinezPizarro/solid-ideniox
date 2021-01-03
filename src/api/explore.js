import data from "@solid/query-ldflex";
import auth from "solid-auth-client";
import SolidFileClient from "solid-file-client";
import Cache from "./Cache";

const cache = new Cache();
const fileCache = new Cache();

const fc = new SolidFileClient(auth, { enableLogging: true });

const patterns = {
    editable: /\.(txt|diff?|patch|svg|asc|cnf|cfg|conf|html?|cfm|cgi|aspx?|ini|pl|py|md|css|cs|jsx?|jsp|log|htaccess|htpasswd|gitignore|gitattributes|env|json|atom|eml|rss|markdown|sql|xml|xslt?|sh|rb|as|bat|cmd|cob|for|ftn|frm|frx|inc|lisp|scm|coffee|php[3-6]?|java|c|cbl|go|h|scala|vb|tmpl|lock|go|yml|yaml|tsv|lst|ttl)$/i,
    image: /\.(jpe?g|gif|bmp|png|svg|tiff?)$/i,
    media: /\.(mp3|ogg|wav|mp4|webm)$/i,
    video: /\.(mp4|webm|ogg)$/i,
    extractable: /\.(zip)$/i,
};

const getSession = async () => {
    let session = await auth.currentSession(localStorage);
    return session;
};

export const getWebId = async () => {
    let session = await getSession();
    let webId = session.webId;
    return webId;
};

export const getRoot = async () => {
    let me = data[await getWebId()];
    console.log(me)
    return `${await me["solid:account"]}`;
};

export const getFolder = async (folderUrl) => {
    let folderContent = await fc.readFolder(folderUrl);

    const { name, parent, type } = folderContent;

    let folder = {type, name, parent, folderUrl, content:[]};

    //load subfolders
    for (let subFolder of folderContent.folders) {
        const { name, parent, type, url } = subFolder;
        folder.content.push({type, name, parent, url, filetype:'folder'});
    }

    //load files

    for (let file of folderContent.files) {
        const { name, parent, type, url } = file;

        folder.content.push({type, name, parent, url, filetype:'file'});
    }

    return folder;
};

export const readFile = async (fileUrl) => {
    if (fileCache.contains(fileUrl)) return fileCache.get(fileUrl);

    let fileContent = await fc.readFile(fileUrl);
    return cache.add(fileUrl, fileContent);
};


export const uploadFile = async (folder, filename, contentType, content) => {
    return await fc.putFile(buildFileUrl(folder, filename), content, contentType);
};

const buildFileUrl = (path, fileName) => {
    return `${path.concat(fileName)}`;
};
