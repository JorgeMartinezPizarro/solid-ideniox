import { Button } from 'react-bootstrap';

import Login from './components/Login.js'
import Read from './components/Read.js'
import Write from './components/Write.js'
import Nicks from './components/Nicks';
import Demo from './components/Demo';

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
