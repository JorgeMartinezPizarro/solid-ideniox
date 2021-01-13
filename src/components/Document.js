import {Table} from "react-bootstrap";

import React from "react";


export default ({profile}) => {
    return <Table>
        <thead>
        <tr>
            <th>Subject</th>
            <th>Predicate</th>
            <th>Object</th>
        </tr>
        </thead>
        <tbody>

            {profile.map(p=> {
                return <tr>
                    <td>{p.subject}</td>
                    <td>{p.predicate}</td>
                    <td>{p.object}</td>
                </tr>
            })}
        </tbody>
    </Table>
}
