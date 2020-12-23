import {AuthButton, LoggedIn, LoggedOut} from "@solid/react";

export default () => {
    return <>
        <LoggedOut>
            <p>You are not logged in.</p>
        </LoggedOut>
        <LoggedIn>
            <p>Congratulations, you're logged in!</p>
        </LoggedIn>
        <AuthButton popup="https://pod.ideniox.com/common/popup.html" login="LOGIN" logout="LOGOUT"/>
    </>
}
