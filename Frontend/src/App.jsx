import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import BotaoTema from './components/BotaoTema';
import FormularioCadastro from './components/FormularioCadastro';
import ListaUsuarios from './components/ListaUsuarios';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <div className="app-container">
          <div className="app-layout">
            <BotaoTema />
            <FormularioCadastro />
            <div className="app-divider">
              <span>ou</span>
            </div>
            <ListaUsuarios />
          </div>
        </div>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
