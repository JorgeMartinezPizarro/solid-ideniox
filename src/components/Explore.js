import React, {useState, useEffect} from 'react';

import { Spinner, Button, Dropdown } from 'react-bootstrap';

import {
    useHistory
} from "react-router-dom";

import File from './File'

import _ from 'lodash';

import {
    getFolder,
    getRoot,
    uploadFile,
    removeFile,
    createFolder,
    rename,
} from "../api/explore"

import {shareFile,sendNotification} from "../api/things"


const Explore = ({inbox}) => {

    const history = useHistory();

    const path = history.location.search.replace('?path=', '');
    const [folder, setFolder] = useState({});
    const [selectedFolder, setSelectedFolder] = useState(path);
    const [showACL, setShowACL] = useState(false);
    const [root, setRoot] = useState('');
    const [selectedFile, setSelectedFile] = useState({});
    const [showNewFolder, setShowNewFolder] = useState(false)
    const [newFolder, setNewFolder] = useState([]);
    const [renameFrom, setRenameFrom] = useState('');
    const [renameTo, setRenameTo] = useState('');
    const [error, setError] = useState({});




    const browseToFolder = async (path) => {
        setRenameFrom('');
        setRenameTo('');
        const folder = await getFolder(path);
        setSelectedFolder(path);
        setFolder(folder);
        setSelectedFile({});
        setShowACL(false);
    };

    const showFile = async (item) => {
        if (renameFrom!=='') return;
        setShowACL(false);
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
            className={'explore-items'}
        >
            <div className={'explore-icon'} >
                {getIcon(item.type)}
            </div>
            <div className={item.url===renameFrom ? "resource-input" : "explore-text-name"} onClick={async () => {
                if (item.type==='folder')
                    await browseToFolder(item.url);
                else
                    await showFile(item);
            }}>
                <>
                    {item.url===renameFrom
                        && <>
                            <input onClick={e=>e.stopPropagation()} type='text' value={renameTo} onChange={e=>setRenameTo(e.target.value)} />
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
                            <Button variant='danger' onClick={e=>{
                                e.stopPropagation();
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
                <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        <span className="material-icons">more_horiz</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item  onClick={async (e)=>{
                            e.stopPropagation()
                            const x = await removeFile(item.url);
                            if (x.error) setError(error)
                            setFolder (await getFolder(selectedFolder))

                        }}>
                            Remove
                        </Dropdown.Item>
                        <Dropdown.Item onClick={async (e)=>{
                            e.stopPropagation()
                            setRenameFrom(item.url)
                            setRenameTo(item.url)

                        }}>Rename</Dropdown.Item>
                        {!_.isEmpty(inbox) &&
                            <Dropdown.Item onClick={async (e)=>{
                            e.stopPropagation()
                            await shareFile(item.url, inbox.url)
                            await sendNotification('I want to share a file with you', 'xxx', inbox.url, inbox.inbox, [], [item.url]);

                        }}>Share</Dropdown.Item>}
                    </Dropdown.Menu>
                </Dropdown>
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

    if (!root) return <Spinner animation="border" />;

    const uploadFiles = async (files) => {

        for(let i=0;i<files.length;i++){
            const content = files[i];
            await uploadFile(selectedFolder, files[i].name, files[i].type, content);
        }
        const folder = await getFolder(selectedFolder);
        setFolder(folder)

    };

    return <>
        <div className={'explore-file-content'}>
            {showNewFolder && <>
                <div className={'explore-modal-wrapper'}>

                </div>
                <div className={'explore-modal-create'}>
                    <h3>Create folder</h3>
                    <input onChange={e => setNewFolder(e.target.value)} type="text" multiple />
                    <Button type="button" value="create Folder" variant='primary' onClick={async ()=>{
                        if (newFolder.indexOf('/') || newFolder.indexOf('.ttl') )
                            await createFolder(selectedFolder+newFolder)
                        else
                            await createFolder(selectedFolder+newFolder+"/")

                        setShowNewFolder(false);
                        setFolder(await getFolder(selectedFolder))
                    }}>Create</Button>
                    <Button variant='danger' onClick={() => setShowNewFolder(false)}>Cancel</Button>
                </div>
            </>}
            <div className={'header'}>
                <div className='explore-header-line'>
                    {(_.isEmpty(selectedFile) && root !== selectedFolder) && <div  >
                        <div onClick={() => browseToFolder(folder.parent)} className={'explore-icon'} key={'home'}><span className="material-icons">arrow_back</span></div>
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
