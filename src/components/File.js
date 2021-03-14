import _ from 'lodash';
import React, {useState, useEffect} from 'react';

import { Table, Row, Button } from 'react-bootstrap';

import {readFile, uploadFile} from "../api/explore";

import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';

const File = props => {

    const [content, setContent] = useState(undefined);
    const [edit, setEdit] = useState(false);
    const [loading, setLoading] = useState(false);

    const a = async () => {
        if (!props.file.url) return;
        setLoading(true)
        try {
            const content = await readFile(props.file.url);
            if (typeof content === 'object') {
                const urlCreator = window.URL || window.webkitURL;
                const imageUrl = urlCreator.createObjectURL(content);
                setContent(<iframe title={imageUrl} style={{width: '600px', height: '600px'}} src={imageUrl} />);
            }
            else
                setContent(content)
            setLoading(false)
        } catch (e) {
            setContent(undefined)
        }
    }

    useEffect(() => {
        a()
    }, []);

    if (!props.file) return <></>;

    console.log(_.isString(content))

    return <>
        <Row>
            {(!loading && !edit ) && <pre className={'explore-content'}>{content}</pre>}
        </Row>
        <Row>
            {(typeof content === 'string' && !loading && edit )&& <>
                <div className={'ui-wrapper'}>
                    <Editor
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
            {(typeof content === 'string' && !edit) && <Button onClick={e=>setEdit(!edit)}><span className="material-icons">edit</span></Button>}
        </Row>

    </>
}

export default File;
