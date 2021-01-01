import React, {useState, useEffect} from 'react';

import { Table, Container } from 'react-bootstrap';

import File from './File'

import _ from 'lodash';

import {
    getFolder,
    getRoot,
    readFile,
} from "../api/explore"


export default () => {

    const [folder, setFolder] = useState({});
    const [selectedFolder, setSelectedFolder] = useState('');
    const [root, setRoot] = useState('');
    const [selectedFile, setSelectedFile] = useState('');
    const [content, setContent] = useState('');

    const browseToFolder = async (path) => {
        const root = path;
        const folder = await getFolder(root);
        setSelectedFolder(root);
        setFolder(folder);
        setSelectedFile('');

    };

    const showFile = async (path) => {
        const content = await readFile(path)

        setSelectedFile(path)
        if (typeof content === 'object') {
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(content);
            setContent(<img src={imageUrl} />)
            return;
        }
        setContent(content)
    }

    const renderItem = (item) => {
        return <tr
            onClick={() => {
                if (item.type==='folder')
                    browseToFolder(item.url)
                else
                    showFile(item.url)

            }}
            className={'explore-items'}
        >
            <td>
                <img
                    src={item.type==='folder'?'/folder.png':'/file.svg'}
                />
            </td>
            <td>
                <div>
                    {item.url}
                </div>
            </td>
        </tr>;
    }

    useEffect(async () => {
        const root = await getRoot();
        const folder = await getFolder(root);
        setRoot(root)
        setSelectedFolder(root)
        setFolder(folder)

    }, []);

    if (!root) return "LOADING";

    if (selectedFile) {
        return <Container>
            <h1>{selectedFolder}</h1>
            <Table>
                <tr className={"explore-items"}><td><img src={'home.png'} /></td><td>{root && <div onClick={() => browseToFolder(root)}>{root}</div>}</td></tr>
            </Table>
            <File
                file={selectedFile}
                content={content}
            />
        </Container>
    }

    return <Container>
        <h1>{selectedFolder}</h1>
        <Table>
            <tr className={"explore-items"}><td><img src={'/home.png'} /></td><td>{root && <div onClick={() => browseToFolder(root)}>{root}</div>}</td></tr>
            {_.map(folder.content, renderItem)}
        </Table>

    </Container>
}
