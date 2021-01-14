import {Table} from "react-bootstrap";

import React from "react";


export default ({profile}) => {
    return <Table className={'document-view'}>
        <thead>
        <tr>
            <th style={{width: '200px'}}>Subject</th>
            <th style={{width: '200px'}}>Predicate</th>
            <th style={{width: '200px'}}>Object</th>
        </tr>
        </thead>
        <tbody>

            {profile.map(p=> {
                return <tr>
                    <td title={p.subject}>{p.subject}</td>
                    <td title={p.predicate}>{p.predicate}</td>
                    <td title={p.object}>{p.object}</td>
                </tr>
            })}
        </tbody>
    </Table>
}
