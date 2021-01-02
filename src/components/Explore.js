import React, {useState, useEffect} from 'react';

import { Table, Container, Row, Spinner } from 'react-bootstrap';

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
        const folder = await getFolder(path);
        setSelectedFolder(path);
        setFolder(folder);
        setSelectedFile('');
    };

    const showFile = async (path) => {
        const content = await readFile(path);

        setSelectedFile(path)
        if (typeof content === 'object') {
            const urlCreator = window.URL || window.webkitURL;
            const imageUrl = urlCreator.createObjectURL(content);
            setContent(<img src={imageUrl} />)
            // TODO: take care with videos or audios
            return;
        }
        setContent(content)
    }

    const renderItem = (item) => {
        return <tr
            onClick={async () => {
                if (item.type==='folder')
                    await browseToFolder(item.url)
                else
                    await showFile(item.url)

            }}
            className={'explore-items'}
        >
            <td className={'explore-icon'} >
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

    if (!root) return <Spinner animation="border" />;

    if (selectedFile) {
        return <Container>

            <Table>
                <tr className={"explore-items"}><td className={'explore-icon'}><img src={'location.png'} /></td><td><div>{selectedFile}</div></td></tr>
                <tr className={"explore-items"}><td className={'explore-icon'}><img src={'home.png'} /></td><td>{root && <div onClick={() => browseToFolder(root)}>{root}</div>}</td></tr>
            </Table>
            <File
                file={selectedFile}
                content={content}
            />
        </Container>
    }

    return <Container>
        <Table>
            <tr className={"explore-items"}><td className={'explore-icon'}><img src={'location.png'} /></td><td><div>{selectedFolder}</div></td></tr>
            <tr className={"explore-items"}><td className={'explore-icon'}><img src={'/home.png'} /></td><td>{root && <div onClick={() => browseToFolder(root)}>{root}</div>}</td></tr>
            {_.map(folder.content, renderItem)}
        </Table>
    </Container>
}
