import React, {useState, useEffect} from 'react';

import { Table, Container, Spinner, Button, Alert, Dropdown } from 'react-bootstrap';

import {
    useHistory
} from "react-router-dom";

import File from './File'

import ContextMenu from './ContextMenu';

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


const Explore = () => {

    const history = useHistory();

    const path = history.location.search.replace('?path=', '');
    const [folder, setFolder] = useState({});
    const [selectedFolder, setSelectedFolder] = useState(path);
    const [selectedFolderACL, setSelectedFolderACL] = useState('');
    const [showACL, setShowACL] = useState(false);
    const [root, setRoot] = useState('');
    const [selectedFile, setSelectedFile] = useState({});
    const [files, setFiles] = useState([]);
    const [newACL, setNewACL] = useState('');
    const [showNewFolder, setShowNewFolder] = useState(false)
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
    }, [selectedFolder, history]);



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

        return <div key={item.url}
            onClick={async () => {
                if (item.type==='folder')
                    await browseToFolder(item.url);
                else
                    await showFile(item);
            }}
            className={'explore-items'}
        >
            <div className={'explore-icon'} >
                {getIcon(item.type)}
            </div>
            <div className={item.url===renameFrom ? "resource-input" : "explore-text-name"}>
                <>
                    {item.url===renameFrom
                        && <>
                            <input type='text' value={renameTo} onChange={e=>setRenameTo(e.target.value)} />
                            <Button onClick={async(e)=>{
                                try{
                                    await rename(renameFrom,renameTo);
                                } catch (e){console.error(e)}

                                e.stopPropagation();
                                setRenameFrom('');
                                setRenameTo('');
                                setFolder (await getFolder(selectedFolder));

                            }}
                            >Accept</Button>
                            <Button variant='danger' onClick={()=>{
                                setRenameFrom('');
                                setRenameTo('');
                            }}
                            >Cancel</Button>
                        </>
                    }
                    {item.url!==renameFrom
                        && item.name
                    }
                </>
            </div>
            <div className={'icons'}>
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
            </div>
        </div>;
    };



    useEffect(() => {
        getRoot().then(root => {
            if (_.isEmpty(selectedFolder)) {
                setSelectedFolder(root)
                setRoot(root)
                getFolder(root).then(setFolder)
            }
            else {
                getFolder(selectedFolder).then(setFolder)
                setRoot(root)
            }
        });



    }, [selectedFolder]);

    useEffect(() => {
        if (!selectedFolder) return;
        const x = selectedFolder + '.acl';
        readFile(x).then(setSelectedFolderACL).catch(e=>{
            console.error("WTF", e)
            setSelectedFolderACL('Error loading ACL')
        });
    }, [selectedFolder])

    if (!root) return <Spinner animation="border" />;

    const uploadFiles = async (files) => {

        for(let i=0;i<files.length;i++){
            const content = files[i];
            await uploadFile(selectedFolder, files[i].name, files[i].type, content);
        }
        const folder = await getFolder(selectedFolder);
        setFolder(folder)

    };

    console.log(selectedFile)

    return <>
        <div className={'explore-file-content'}>
            {showNewFolder && <div className={'explore-modal-wrapper'}>
                <div className={'explore-modal-create'}>
                    <input onChange={e => setNewFolder(e.target.value)} type="text" multiple />
                    <Button type="button" value="create Folder" variant='primary' onClick={async ()=>{
                        if (newFolder.indexOf('/') || newFolder.indexOf('.ttl') )
                            await createFolder(selectedFolder+newFolder)
                        else
                            await createFolder(selectedFolder+newFolder+"/")
                        setFolder(await getFolder(selectedFolder))
                    }}><span className="material-icons">add</span></Button>
                    <Button onClick={() => setShowNewFolder(false)}><span className="material-icons">arrow_back</span></Button>
                </div>
            </div>}
            <div className={'header'}>
                <div className='explore-header-line'>
                    {(_.isEmpty(selectedFile) && root !== selectedFolder) && <div onClick={() => browseToFolder(folder.parent)} >
                        <div className={'explore-icon'} key={'home'}><span className="material-icons">arrow_back</span></div>
                        <div className={'explore-header-location'}>{folder.parent &&
                        <div>
                            {selectedFolder}
                        </div>
                        }</div>
                    </div>}

                    {!_.isEmpty(selectedFile) && <div onClick={() => browseToFolder(selectedFile.parent)} >
                        <div className={'explore-icon'} key={'home'}><span className="material-icons">arrow_back</span></div>
                        <div className={'explore-header-location'}>{folder.parent && <div>
                            {selectedFile.url}
                        </div>}</div>
                        <div></div>
                    </div>}
                </div>
                <div className={'explore-header-actions'}>
                    <Button onClick={() => setShowACL(!showACL)}><span className="material-icons">{showACL ? 'lock_open' : 'lock'}</span></Button>
                    <Button onClick={() => browseToFolder(root)}><span className="material-icons">home</span></Button>
                    {_.isEmpty(selectedFile) && <Button onClick={() => setShowNewFolder(!showNewFolder)}><span className="material-icons">add</span></Button>}
                    {(_.isEmpty(selectedFile) && selectedFolder) && <>
                        <Button onClick={() => document.getElementById('fileArea').click() }>
                            <span className="material-icons">upload</span>
                            <input onChange={async e => {
                                await uploadFiles(e.target.files)
                            }} type="file" id="fileArea" />
                        </Button>
                    </>}
                </div>
            </div>
            <div className={'content'}>
                <div>
                    {showACL &&
                        <>
                            <div>ACL</div>
                            <div><File file={{url: _.isEmpty(selectedFile) ? selectedFolder+'.acl' : selectedFile.url+'.acl', type: 'text/turtle'}} /></div>
                        </>
                    }

                    {(!showACL && !_.isEmpty(selectedFile)) &&
                    <div>
                        <File
                            file={selectedFile}
                            folder={selectedFolder}
                        />
                    </div>
                    }



                            {(!showACL && _.isEmpty(selectedFile)) && _.map(folder.content, renderItem)}

                </div>
            </div>
        </div>
    </>
}

export default Explore;
