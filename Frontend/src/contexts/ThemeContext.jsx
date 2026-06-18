import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [tema, setTema] = useState(() => {
        const salvo = localStorage.getItem('tema');
        return salvo || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('tema', tema);
        document.documentElement.setAttribute('data-tema', tema);
    }, [tema]);

    const alternarTema = () => {
        setTema(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <ThemeContext.Provider value={{ tema, alternarTema }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTema() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTema deve ser usado dentro de ThemeProvider');
    }
    return context;
}

export default ThemeContext;