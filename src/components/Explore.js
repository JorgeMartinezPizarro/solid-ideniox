import React, {useState, useEffect} from 'react';

import { Table, Container, Row, Spinner, Button, Alert } from 'react-bootstrap';

import File from './File'

import _ from 'lodash';

import {
    getFolder,
    getRoot,
    readFile,
    uploadFile,
    removeFile,
    createFolder,
    rename,
} from "../api/explore"


export default () => {

    const [folder, setFolder] = useState({});
    const [selectedFolder, setSelectedFolder] = useState('');
    const [root, setRoot] = useState('');
    const [selectedFile, setSelectedFile] = useState({});
    const [files, setFiles] = useState([]);
    const [newFolder, setNewFolder] = useState([]);
    const [renameFrom, setRenameFrom] = useState('');
    const [renameTo, setRenameTo] = useState('');
    const [error, setError] = useState({});

    const browseToFolder = async (path) => {
        if (renameFrom!=='')
        return
        const folder = await getFolder(path);
        setSelectedFolder(path);
        setFolder(folder);
        setSelectedFile({});
    };

    const showFile = async (item) => {
        if (renameFrom!=='') return;
        setSelectedFile(item);
    }

    const renderItem = (item) => {
        return <tr key={item.url}
            onClick={async () => {
                if (item.type==='folder')
                    await browseToFolder(item.url)
                else
                    await showFile(item)

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
                    {item.url===renameFrom
                        && <>
                            <input type='text' value={renameTo} onChange={e=>setRenameTo(e.target.value)} />
                            <Button onClick={async(e)=>{
                                try{
                                    await rename(renameFrom,renameTo);
                                } catch (e){console.error(e)}

                                e.stopPropagation()
                                setRenameFrom('')
                                setRenameTo('')
                                setFolder (await getFolder(selectedFolder))

                            }}
                            >Accept</Button>
                        </>
                    }
                    {item.url!==renameFrom
                        && item.url
                    }
                </div>
            </td>
            <td style={{textAlign: 'right'}}>

                     <Button variant='danger' onClick={async (e)=>{
                        e.stopPropagation()
                        const x = await removeFile(item.url);
                        if (x.error) setError(error)
                        setFolder (await getFolder(selectedFolder))

                    }} ><span className="material-icons">delete</span></Button>
                    <Button variant='primary' onClick={async (e)=>{
                        e.stopPropagation()
                        setRenameFrom(item.url)
                        setRenameTo(item.url)

                    }} ><span className="material-icons">edit</span></Button>
            </td>
        </tr>;
    };



    useEffect(async () => {
        const root = await getRoot();
        const folder = await getFolder(root);
        setRoot(root)
        setSelectedFolder(root)
        setFolder(folder)
    }, []);

    if (!root) return <Spinner animation="border" />;
    console.log(selectedFile)
    if (!_.isEmpty(selectedFile)) {
        return <Container>
            {!_.isEmpty(error) && <Alert variant={'danger'}>{JSON.stringify(error, null, 2)}</Alert>}
            <Table>
                <tbody>
                    <tr className={"explore-items"}><td className={'explore-icon'} key={'location'}><img src={'location.png'} /></td><td><div>{selectedFile.url}</div></td></tr>
                    <tr className={"explore-items"}><td className={'explore-icon'} key={'home'}><img src={'home.png'} /></td><td>{root && <div onClick={() => browseToFolder(root)}>{root}</div>}</td></tr>
                </tbody>
            </Table>
            <File
                file={selectedFile}
            />
        </Container>
    }

    const uploadFiles = async () => {
        console.log(files)

        for(let i=0;i<files.length;i++){
            const content = files[i];
            await uploadFile(selectedFolder, files[i].name, files[i].type, content);
        }
        const folder = await getFolder(selectedFolder);
        setFolder(folder)

    }

    return <Container>
        {!_.isEmpty(error) && <Alert variant={'danger'}>{JSON.stringify(error, null, 2)}</Alert>}
        <Table>
            <tbody>
                <tr>
                    <td/>
                    <td><input onChange={e => setFiles(e.target.files)} type="file" id="fileArea"  multiple/></td>

                    <td style={{textAlign: 'right'}}><Button type="button" value="upload" variant='primary' onClick={uploadFiles}><span className="material-icons">upload</span></Button></td>
                </tr>
                <tr>
                    <td></td>
                    <td><input onChange={e => setNewFolder(e.target.value)} type="text" multiple /></td>

                    <td style={{textAlign: 'right'}}><Button type="button" value="create Folder" variant='primary' onClick={async ()=>{
                        if (newFolder.indexOf('/') )
                            await createFolder(selectedFolder+newFolder)
                        else
                            await createFolder(selectedFolder+newFolder+"/")
                        setFolder(await getFolder(selectedFolder))
                    }}><span className="material-icons">add</span></Button></td>
                </tr>
                <tr className={"explore-items"}>
                    <td className={'explore-icon'} key={'location'}><img src={'location.png'} /></td>
                    <td><div>{selectedFolder}</div></td>
                    <td></td>
                </tr>
                <tr onClick={() => browseToFolder(root)} className={"explore-items"}>
                    <td className={'explore-icon'} key={'home'}><img src={'/home.png'} /></td>
                    <td>{root && <div>{root}</div>}</td>
                    <td></td>
                </tr>
                {_.map(folder.content, renderItem)}
            </tbody>
        </Table>

    </Container>
}
