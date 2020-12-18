import React, {useState, useEffect} from 'react';
import { useLDflexValue } from '@solid/react';
import data from '@solid/query-ldflex';

export default () => {
    const savedName = useLDflexValue('user.name') || "";
    const [name, setName] = useState(savedName);
    useEffect(() => {savedName && setName(savedName)}, [savedName])
    const saveName = async () => {
        await data.user.name.set(name);
    }
    return (
        <>
            <marquee>{savedName && savedName.toString()}</marquee>
            <input type="text" value={name} onChange={e => setName(e.target.value)}/>
            <button onClick={saveName}>set name</button>
        </>
    );
}
