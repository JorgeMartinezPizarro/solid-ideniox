import React, {useState, useEffect} from 'react';
import {
    getFriendData, getWebId,
} from "../api/friends";

export default props => {

    const [friendsData, setFriendsData] = useState([]);


    useEffect(async () => {
        const webId = await getWebId();
        getFriendData(webId).then(fd => setFriendsData(fd))
    }, []);


    return <>
        <pre>
            {friendsData.url && <p>{friendsData.url}</p>}
            {friendsData.image && <img src={friendsData.image} />}

        </pre>
        </>
}
