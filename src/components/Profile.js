import React, { useState, useEffect } from 'react';

import { Button, Container, Row, Table } from 'react-bootstrap';

import _ from 'lodash';

import {getProfile, editValue} from '../api/things'

export default () => {

    const [currentCard, setCurrentCard] = useState({});
    const [editing, setEditing] = useState({});
    const [typeValue, setTypeValue] = useState('');

    useEffect(async () => {
        setCurrentCard(await getProfile())
    }, []);

    const renderObject = (card, id, type) => {
        return <Table className={'profile-table'}>
            <tbody>
                <tr style={{height: '0'}}>
                    <td style={{height: '0', width: '100px'}}/>
                    <td/>
                    <td style={{height: '0', width: '170px'}}/>
                </tr>
                {_.map(card, (values, property) => {
                    return <>
                        <tr style={{background: 'silver'}}>
                            <td colSpan={3}>{property}</td>
                        </tr>
                        {_.map(values, value => {
                            if (value.type === 'Literal') {

                                return <tr>
                                    <td></td>
                                    <td>{value.value}</td>
                                    <td>
                                        <Button variant={'danger'}><span
                                            className="material-icons">delete</span></Button>
                                        <Button onClick={() => {
                                            setTypeValue(value.value);
                                            setEditing({
                                                nodeType: type,
                                                subject: id,
                                                predicate: property,
                                                objectType: value.type,
                                                object: value.value,

                                            })
                                        }}><span className="material-icons">edit</span></Button>
                                    </td>
                                </tr>
                            }
                            else if (value[value.value]){

                                return <>
                                    <tr>
                                        <td colSpan={3}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{value.value}</td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td colSpan={2}>{_.map(value[value.value], v => renderObject(v, value.value, value.type))}</td>
                                    </tr>
                                </>
                            }
                            else {
                                return <tr>
                                    <td></td>
                                    <td><a href={value.value}>{value.value}</a></td>
                                    <td>
                                        <Button variant={'danger'}><span
                                            className="material-icons">delete</span></Button>
                                        <Button onClick={() => {
                                            setTypeValue(value.value);
                                            setEditing({
                                                nodeType: type,
                                                subject: id,
                                                predicate: property,
                                                objectType: value.type,
                                                object: value.value,

                                            })
                                        }}><span className="material-icons">edit</span></Button>
                                    </td>
                                </tr>
                            }
                        })}
                    </>

                })}
            </tbody>
        </Table>
    }

    if (!_.isEmpty(editing)) {
        return <Container>
            <input style={{width: '100%'}} type={'text'} value={typeValue} onChange={e=>setTypeValue(e.target.value)}/>
            <Button onClick={() => setEditing({})} variant={'danger'}>Cancel</Button>
            <Button onClick={async () => {
                await editValue(editing.nodeType, editing.subject, editing.predicate, editing.objectType, editing.object, typeValue);
                setCurrentCard(await getProfile());
                setEditing({});
            }}>Change</Button>

        </Container>
    }

    return <Container>
        <div>Edit your contact information</div>
        {_.map(currentCard, (card, webId) => {
            return renderObject(card, webId, 'NamedNode')
        })}
    </Container>
}
