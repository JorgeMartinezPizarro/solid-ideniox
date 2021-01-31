import React, {useState, useEffect} from 'react';

import { Table, Row, Button } from 'react-bootstrap';

import {readFile, uploadFile} from "../api/explore";

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

const File = props => {

    const [acl, setAcl] = useState('');

    const [content, setContent] = useState('');
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showACL, setShowACL] = useState(false);

    const a = async () => {
        if (!props.file.url) return;
        try {
            console.log(props.file.url);
            const f = await readFile(props.file.url + '.acl');
            setAcl(f);
        } catch (e) {}
        setLoading(true)
        const content = await readFile(props.file.url);
        if (typeof content === 'object') {
            const urlCreator = window.URL || window.webkitURL;
            const imageUrl = urlCreator.createObjectURL(content);
            setContent(<iframe title={imageUrl} style={{width: '600px', height: '600px'}} src={imageUrl} />);
        }
        else
            setContent(content)
        setLoading(false)
    }

    useEffect(() => {
        const b = async () => {
            if (!props.file.url) return;
            try {
                console.log(props.file.url);
                const f = await readFile(props.file.url + '.acl');
                setAcl(f);
            } catch (e) {}
            setLoading(true)
            const content = await readFile(props.file.url);
            if (typeof content === 'object') {
                const urlCreator = window.URL || window.webkitURL;
                const imageUrl = urlCreator.createObjectURL(content);
                setContent(<iframe title={imageUrl} style={{width: '600px', height: '600px'}} src={imageUrl} />);
            }
            else
                setContent(content)
            setLoading(false)
        }
        b().then().catch();
    }, [props.file.url]);

    if (!props.file) return <></>;

    return <>
        <Table className={'explore-table'}>
            <tbody>
            <tr style={{height: '0'}}>
                <td style={{width: '50px'}}>&nbsp;</td>
                <td >&nbsp;</td>
                <td style={{width: '150px'}}>&nbsp;</td>
            </tr>
            <tr onClick={e => {
                e.stopPropagation();
                setShowACL(!showACL)
            }} className={"explore-items"}>
                <td className={'explore-icon'} key={'location'}><span className="material-icons">location_on</span></td>
                <td><div>{props.file.url}</div></td>
                <td className={'icons'}><Button><span className="material-icons">{!showACL ? 'visibility' : 'visibility_off'}</span></Button></td>
            </tr>
            </tbody>
        </Table>
        <Row>
            {(showACL) && <p>ACL</p>}
        </Row>
        <Row>
            {(showACL) && <pre className={'explore-content'}>{acl || 'Acl not found'}</pre>}
        </Row>
        <Row>
            <p>Content</p>
        </Row>
        <Row>
            {(!loading && !edit ) && <pre className={'explore-content'}>{content}</pre>}
        </Row>
        <Row>
            {(typeof content === 'string' && !loading && edit )&& <>
                <div className={'ui-wrapper'}>
                    <Editor
                        value={content}
                        onValueChange={code => setContent(code) }
                        highlight={code => highlight(code, languages.js)}
                        padding={10}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 12,
                        }}

                        value={content}
                        onBeforeChange={(e, d, v) => {
                            console.log(e, d, v)
                        }}
                        //onChange={e => setContent(e.target.value)}
                        options={{
                            lineNumbers: true,
                            theme: 'solarized light',
                            mode: "sparql",
                        }}
                    />
                </div>
                <Button onClick={async () => {
                    await uploadFile(props.folder, props.file.url.replace(props.folder, ''), props.file.type, content);
                    setEdit(false);
                    await a();
                }}>Save</Button>
                <Button variant='danger' onClick={async () => {
                    setEdit(false)
                    await a();
                }}>Cancel</Button>
            </>}
        </Row>
        <Row>
            {(typeof content === 'string' && !edit) && <Button onClick={e=>setEdit(!edit)}>edit</Button>}
        </Row>

    </>
}

export default File;
