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
        try {
            const f = await readFile(props.file.url + '.acl')
            setAcl(f)
        } catch (e) {}
        setLoading(true)
        const content = await readFile(props.file.url);
        if (typeof content === 'object') {

            const urlCreator = window.URL || window.webkitURL;
            const imageUrl = urlCreator.createObjectURL(content);
            setContent(<img style={{width: '600px', height: '600px'}} src={imageUrl} />)

        }
        else
            setContent(content)
        setLoading(false)
    }, [])



return <Container>
    <Row>
        <pre>{JSON.stringify(props.file, null, 2)}</pre>
    </Row>
    <Row>
        <p>ACL</p>
    </Row>
    <Row>
        {acl && <pre className={'explore-content'}>{acl}</pre>}
    </Row>
    <Row>
        <p>Content</p>
    </Row>
    <Row>
        {!loading && <pre className={'explore-content'}>{content}</pre>}
    </Row>

</Container>
}
