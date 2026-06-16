import React from 'react';
import { UserProvider } from './contexts/UserContext';
import FormularioCadastro from './components/FormularioCadastro';
import ListaUsuarios from './components/ListaUsuarios';
import './App.css';

function App() {
  return (
    <UserProvider>
      <div className="app-container">
        <div className="app-layout">
          <FormularioCadastro />
          <div className="app-divider">
            <span>ou</span>
          </div>
          <ListaUsuarios />
        </div>
      </div>
    </UserProvider>
  );
}

export default App;
