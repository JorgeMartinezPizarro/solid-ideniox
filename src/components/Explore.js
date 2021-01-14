import React, {useState, useEffect} from 'react';

import { Table, Container, Row, Spinner, Button, Alert } from 'react-bootstrap';

import {
    useParams,
    useHistory
} from "react-router-dom";

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

    const history = useHistory();

    const path = history.location.search.replace('?path=', '');
    const [folder, setFolder] = useState({});
    const [selectedFolder, setSelectedFolder] = useState(path);
    const [selectedFolderACL, setSelectedFolderACL] = useState('');
    const [showACL, setShowACL] = useState(false);
    const [root, setRoot] = useState('');
    const [selectedFile, setSelectedFile] = useState({});
    const [files, setFiles] = useState([]);
    const [newFolder, setNewFolder] = useState([]);
    const [renameFrom, setRenameFrom] = useState('');
    const [renameTo, setRenameTo] = useState('');
    const [error, setError] = useState({});

    useEffect(() => {
        if (!_.isEmpty(selectedFolder)) {
            history.push({
                pathname: '/explore',
                search: `?path=${selectedFolder}`,
                state: { detail: 'some_value' }
            });
        }
    }, [selectedFolder]);



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

    const getIcon = type => {
        if (type === 'folder')
            return <span className="material-icons">folder_on</span>;
        else
            return <span className="material-icons">text_snippet</span>;
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
                {getIcon(item.type)}
            </td>
            <td className="resource-input">
                <>
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
                            <Button variant='danger' onClick={()=>{
                                setRenameFrom('')
                                setRenameTo('')
                            }}
                            >Cancel</Button>
                        </>
                    }
                    {item.url!==renameFrom
                        && item.url
                    }
                </>
            </td>
            <td className={'icons'}>

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

        if (_.isEmpty(selectedFolder)) {
            setSelectedFolder(root)
            setRoot(root)
            setFolder(await getFolder(root))
        }
        else {
            setFolder(await getFolder(selectedFolder))
            setRoot(root)
        }

    }, []);

    useEffect(async () => {
        try {
            const x = selectedFolder + '.acl'
            setSelectedFolderACL(await readFile(x))
        } catch (e) {}
    }, [selectedFolder])

    if (!root) return <Spinner animation="border" />;

    if (!_.isEmpty(selectedFile)) {
        return <Container>
            {!_.isEmpty(error) && <Alert variant={'danger'}>{JSON.stringify(error, null, 2)}</Alert>}
            <Table className={'explore-table'}>
                <tbody>
                    <tr style={{height: '0'}}>
                        <td style={{width: '50px'}}>&nbsp;</td>
                        <td >&nbsp;</td>
                        <td style={{width: '150px'}}>&nbsp;</td>
                    </tr>
                    <tr className={"explore-items"}><td className={'explore-icon'} key={'location'}><span className="material-icons">location_on</span></td><td><div>{selectedFile.url}</div></td><td></td></tr>
                    <tr className={"explore-items"}><td className={'explore-icon'} key={'home'}><span className="material-icons">home</span></td><td>{root && <div onClick={() => browseToFolder(root)}>{root}</div>}</td><td></td></tr>
                </tbody>
            </Table>
            <File
                file={selectedFile}
            />
        </Container>
    }

    const uploadFiles = async () => {

        for(let i=0;i<files.length;i++){
            const content = files[i];
            await uploadFile(selectedFolder, files[i].name, files[i].type, content);
        }
        const folder = await getFolder(selectedFolder);
        setFolder(folder)

    }

    return <Container>
        {!_.isEmpty(error) && <Alert variant={'danger'}>{JSON.stringify(error, null, 2)}</Alert>}
        <Table className={'explore-table'}>
            <tbody>
                <tr style={{height: '0'}}>
                    <td style={{width: '50px'}}>&nbsp;</td>
                    <td >&nbsp;</td>
                    <td style={{width: '150px'}}>&nbsp;</td>
                </tr>
                <tr>
                    <td style={{padding: '0!important' }} colSpan={2}><input onChange={e => setFiles(e.target.files)} type="file" id="fileArea"  multiple/></td>

                    <td className={'icons'}><Button type="button" value="upload" variant='primary' onClick={uploadFiles}><span className="material-icons">upload</span></Button></td>
                </tr>
                <tr>
                    <td colSpan={2} className={'resource-input'}><input onChange={e => setNewFolder(e.target.value)} type="text" multiple /></td>

                    <td className={'icons'}><Button type="button" value="create Folder" variant='primary' onClick={async ()=>{
                        if (newFolder.indexOf('/') || newFolder.indexOf('.ttl') )
                            await createFolder(selectedFolder+newFolder)
                        else
                            await createFolder(selectedFolder+newFolder+"/")
                        setFolder(await getFolder(selectedFolder))
                    }}><span className="material-icons">add</span></Button></td>
                </tr>
                <tr className={"explore-items"} onClick={e => {
                    e.stopPropagation();
                    setShowACL(!showACL)
                }}>
                    <td className={'explore-icon'} key={'location'}><span className="material-icons">location_on</span></td>
                    <td><div>{selectedFolder}</div></td>
                    <td className={'icons'}><Button><span className="material-icons">{!showACL ? 'visibility' : 'visibility_off'}</span></Button></td>
                </tr>
                {showACL && <tr>
                    <td colSpan={3}><pre className={'explore-content'}>{selectedFolderACL}</pre></td>
                </tr>}
                {root !== selectedFolder && <tr onClick={() => browseToFolder(root)} className={"explore-items"}>
                    <td className={'explore-icon'} key={'home'}><span className="material-icons">home</span></td>
                    <td>{root && <div>{root}</div>}</td>
                    <td></td>
                </tr>}
                {_.map(folder.content, renderItem)}
            </tbody>
        </Table>

    </Container>
}
