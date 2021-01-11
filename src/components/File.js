import React, {useState, useEffect} from 'react';

import { Table, Container, Row, Spinner, Button, Alert } from 'react-bootstrap';

import {readFile} from "../api/explore";

import SolidAclParser from 'solid-acl-parser'

export default props => {

    const { AclParser, Permissions } = SolidAclParser
    const { WRITE, CONTROL } = Permissions

    const parser = new AclParser({ aclUrl: props.file.url + '.meta.acl', fileUrl: props.file.url })

    const [acl, setAcl] = useState('');

    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    if (!props.file) return <></>;

    useEffect(async () => {
        if (!props.file.url) return;
        const f = await readFile(props.file.url + '.acl')
        setAcl(f)
        setLoading(true)
        const content = await readFile(props.file.url);
        if (typeof content === 'object') {

            const urlCreator = window.URL || window.webkitURL;
            const imageUrl = urlCreator.createObjectURL(content);
            setContent(<iframe style={{width: '600px', height: '600px'}} src={imageUrl} />)

        }
        else
            setContent(content)
        setLoading(false)
    }, [])



return <div>
<pre>{JSON.stringify(props.file, null, 2)}</pre>
    {acl && <pre className={'explore-content'}>{acl}</pre>}
    {!loading && <pre className={'explore-content'}>{content}</pre>}

</div>
}
