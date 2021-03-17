import React, { useState, useEffect } from 'react';

import { v4 as uuid } from 'uuid';

import { Button, Table } from 'react-bootstrap';

import _ from 'lodash';

import {getProfile, editValue, addValue, deleteValue, addTrustedApp, deleteNode} from '../api/things'

const Profile = () => {

    const [currentCard, setCurrentCard] = useState({});
    const [editing, setEditing] = useState({});
    const [typeValue, setTypeValue] = useState('');
    const [adding, setAdding] = useState({});
    const [selectedType, setSelectedType] = useState('Literal');
    const [property, setProperty] = useState('');

    const [field1, setField1] = useState('')
    const [field2, setField2] = useState('')
    const [field3, setField3] = useState('')
    const [field4, setField4] = useState('')
    const [field5, setField5] = useState('')

    const [check1, setCheck1] = useState(false);
    const [check2, setCheck2] = useState(false);
    const [check3, setCheck3] = useState(false);
    const [check4, setCheck4] = useState(false);

    useEffect(() => {
        getProfile().then(profile => {
            setCurrentCard(profile)
            console.log(profile)
        });
    }, []);

    const renderObject = (card, id, type) => {
        return <Table key={id} className={'profile-table'}>
            <tbody>
                <tr key='empty-header' style={{height: '0'}}>
                    <td style={{height: '0', width: '100px'}}/>
                    <td/>
                    <td style={{height: '0', width: '170px'}}/>
                </tr>
                {_.map(card, (values, property) => {
                    return <>
                        <tr key={property+'header'} style={{background: 'silver'}}>
                            <td colSpan={2}>{property}</td>
                            <td><Button onClick={() => setAdding({
                                nodeType: type,
                                subject: id,
                                property,
                            })}><span
                                className="material-icons">add</span></Button></td>
                        </tr>
                        {_.map(values, value => {
                            if (value.type === 'Literal') {

                                return <tr key={JSON.stringify(value)}>
                                    <td></td>
                                    <td>{value.value}</td>
                                    <td>
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
                                        <Button onClick={async () => {
                                            await deleteValue(type,id, property, value.type, value.value)
                                            setCurrentCard(await getProfile());
                                        }}
                                            variant={'danger'}><span
                                            className="material-icons">delete</span></Button>

                                    </td>
                                </tr>
                            }
                            else if (value[value.value]){

                                return <>
                                    <tr key={JSON.stringify(value)}>
                                        <td colSpan={2}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{value.type === 'BlankNode' ? "BlankNode" : value.value}</td>
                                        <td>
                                            <Button onClick={() => setAdding({
                                                nodeType: type.type,
                                                subject: value.value,
                                            })}>
                                                <span className="material-icons">add</span>
                                            </Button>
                                            <Button variant='danger' onClick={async () => {
                                                await deleteNode(
                                                    value.node,
                                                    value.origin,
                                                );
                                                setCurrentCard(await getProfile());
                                            }}>
                                                <span className="material-icons">delete</span>
                                            </Button>
                                        </td>
                                    </tr>
                                    <tr key={JSON.stringify(value)+'-subvalues'}>
                                        <td></td>
                                        <td colSpan={2}>{_.map(value[value.value], v => renderObject(v, value.value, value.type))}</td>
                                    </tr>
                                </>
                            }
                            else {
                                return <tr key={JSON.stringify(value)}>
                                    <td></td>
                                    <td><a href={value.value}>{value.value}</a></td>
                                    <td>

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
                                        <Button onClick={async () => {
                                            await deleteValue(type,id, property, value.type, value.value)
                                            setCurrentCard(await getProfile());
                                        }}
                                                variant={'danger'}><span
                                            className="material-icons">delete</span></Button>
                                    </td>
                                </tr>
                            }
                        })}
                    </>

                })}
            </tbody>
        </Table>
    }


    let addingForm = false;
    if (!_.isEmpty(adding)) {
        console.log(adding)
        if (adding.property === 'http://www.w3.org/2006/vcard/ns#hasAddress') {
            addingForm = <>
                <div className={'add-modal-wrapper'}/>
                <div className={'add-modal'}>
                    <div><div style={{display: 'inline-block', width: '20%'}}>Country</div><input style={{width: '80%'}} type={'text'} value={field1} onChange={e=>setField1(e.target.value)}/></div>
                    <div><div style={{display: 'inline-block', width: '20%'}}>Locality</div><input style={{width: '80%'}} type={'text'} value={field2} onChange={e=>setField2(e.target.value)}/></div>
                    <div><div style={{display: 'inline-block', width: '20%'}}>ZIP</div><input style={{width: '80%'}} type={'text'} value={field3} onChange={e=>setField3(e.target.value)}/></div>
                    <div><div style={{display: 'inline-block', width: '20%'}}>Region</div><input style={{width: '80%'}} type={'text'} value={field4} onChange={e=>setField4(e.target.value)}/></div>
                    <div><div style={{display: 'inline-block', width: '20%'}}>Street address</div><input style={{width: '80%'}} type={'text'} value={field5} onChange={e=>setField5(e.target.value)}/></div>
                    <Button onClick={() => setAdding({})} variant={'danger'}>Cancel</Button>
                    <Button onClick={async () => {
                        const x = uuid()
                        const newSubject = adding.subject+'/'+x;
                        await addValue(adding.nodeType, adding.subject, adding.property, "NamedNode", newSubject);
                        await addValue('NamedNode', newSubject, 'http://www.w3.org/2006/vcard/ns#country-name' || property, "Literal", field1);
                        await addValue('NamedNode', newSubject, 'http://www.w3.org/2006/vcard/ns#locality', "Literal", field2);
                        await addValue('NamedNode', newSubject, 'http://www.w3.org/2006/vcard/ns#postal-code', "Literal", field3);
                        await addValue('NamedNode', newSubject, 'http://www.w3.org/2006/vcard/ns#region', "Literal", field4);
                        await addValue('NamedNode', newSubject, 'http://www.w3.org/2006/vcard/ns#street-address', "Literal", field5);
                        setCurrentCard(await getProfile());
                        setField1('')
                        setField2('')
                        setField3('')
                        setField4('')
                        setField5('')
                        setAdding({});
                        setTypeValue("");
                    }}>Change</Button>
                </div>
            </>

        } else if (_.includes(['http://www.w3.org/2006/vcard/ns#hasEmail', 'http://www.w3.org/2006/vcard/ns#hasTelephone'], adding.property)) {
            addingForm = <>
                <div className={'add-modal-wrapper'}/>
                <div className={'add-modal'}>
                    <select onChange={e => setField1(e.target.value)}>
                        <option value={'http://www.w3.org/2006/vcard/ns#Work'}>Work</option>
                        <option value={'http://www.w3.org/2006/vcard/ns#Home'}>Home</option>
                    </select>
                    {adding.property === 'http://www.w3.org/2006/vcard/ns#hasEmail' ? 'Email' : 'Phone'} <input style={{width: '100%'}} type={'text'} value={field2} onChange={e=>setField2(e.target.value)}/>
                    <Button onClick={() => setAdding({})} variant={'danger'}>Cancel</Button>
                    <Button onClick={async () => {
                        const x = uuid()
                        const newSubject = adding.subject+'/'+x;
                        await addValue(adding.nodeType, adding.subject, adding.property, "NamedNode", newSubject);
                        await addValue('NamedNode', newSubject, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', "NamedNode", field1);
                        await addValue('NamedNode', newSubject, 'http://www.w3.org/2006/vcard/ns#value', "NamedNode", adding.property === 'http://www.w3.org/2006/vcard/ns#hasEmail' ? 'mailto:'+field2 : 'tel:'+field2 );
                        setCurrentCard(await getProfile());
                        setField1('')
                        setField2('')
                        setAdding({});
                        setTypeValue("");
                    }}>Change</Button>
                </div>
            </>

        } else if (adding.property === 'http://www.w3.org/ns/auth/acl#trustedApp') {
            addingForm = <>
                <div className={'add-modal-wrapper'}/>
                <div className={'add-modal'}>
                    <div>Read <input type="checkbox" id="coding" name="interest" value="coding" onChange={e => {setCheck1(e.target.checked)}}/></div>
                    <div>Write <input type="checkbox" id="coding" name="interest" value="coding" onChange={e => setCheck2(e.target.checked)}/></div>
                    <div>Append <input type="checkbox" id="coding" name="interest" value="coding" onChange={e => setCheck3(e.target.checked)}/></div>
                    <div>Control <input type="checkbox" id="coding" name="interest" value="coding" onChange={e => setCheck4(e.target.checked)}/></div>

                    <input style={{width: '100%'}} type={'text'} value={field1} onChange={e=>setField1(e.target.value)}/>
                    <Button onClick={() => setAdding({})} variant={'danger'}>Cancel</Button>
                    <Button onClick={async () => {
                        await addTrustedApp(check1, check2, check3, check4, field1)

                        setCurrentCard(await getProfile());
                        setField1('')
                        setCheck1(false)
                        setCheck2(false)
                        setCheck3(false)
                        setCheck4(false)
                        setAdding({});
                        setTypeValue("");
                    }}>Change</Button>
                </div>
            </>
        }
        else {
            addingForm = <>
                <div className={'add-modal-wrapper'}/>
                <div className={'add-modal'}>
                    {!adding.property && <input style={{width: '100%'}} type={'text'} value={property} onChange={e=>setProperty(e.target.value)}/>}
                    <input style={{width: '100%'}} type={'text'} value={typeValue} onChange={e=>setTypeValue(e.target.value)}/>
                    <select onChange={e => {
                        setSelectedType(e.target.value)
                    }}><option value='Literal'>Literal</option><option value='NamedNode'>URI</option></select>
                    <Button onClick={() => setAdding({})} variant={'danger'}>Cancel</Button>
                    <Button onClick={async () => {
                        await addValue(adding.nodeType, adding.subject, adding.property || property, selectedType, typeValue);
                        setCurrentCard(await getProfile());
                        setAdding({});
                        setTypeValue("");
                    }}>Change</Button>

                </div>
            </>
        }
    }


    const editingForm = !_.isEmpty(editing) &&
        <>
            <div className={'add-modal-wrapper'}/>
            <div className={'add-modal'}>
                <input style={{width: '100%'}} type={'text'} value={typeValue} onChange={e=>setTypeValue(e.target.value)}/>
                <Button onClick={() => setEditing({})} variant={'danger'}>Cancel</Button>
                <Button onClick={async () => {
                    await editValue(editing.nodeType, editing.subject, editing.predicate, editing.objectType, editing.object, typeValue);
                    setCurrentCard(await getProfile());
                    setEditing({});
                }}>Change</Button>

            </div>
        </>


    return <div className='content'>
        <div>Edit your public information</div>
        {_.map(currentCard, (card, webId) => {

            return <>
                {addingForm}
                {editingForm}
                <Button style={{float: 'right'}} onClick={() => setAdding({
                    nodeType: 'NamedNode',
                    subject: webId,
                })}><span
                    className="material-icons">add</span></Button>
                {renderObject(card, webId, 'NamedNode')}
            </>
        })}
    </div>
}

export default Profile;
