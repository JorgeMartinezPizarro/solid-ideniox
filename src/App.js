import logo from './logo.svg';
import Login from './components/Login.js'
import Read from './components/Read.js'
import Write from './components/Write.js'
import Nicks from './components/Nicks';
import Demo from './components/Demo';
import { Button } from "@blueprintjs/core";
import './App.css';

function App() {
  return (
    <>
        <Login />
        <Read />
        <Write />
        <Nicks />
        <Demo />
        <Button>Hola</Button>
    </>
  );
}

export default App;
