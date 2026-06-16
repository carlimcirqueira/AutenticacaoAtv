import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [usuarios, setUsuarios] = useState([]);
    const [paginacao, setPaginacao] = useState(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState('');

    const buscarUsuarios = useCallback(async (pagina = 1, limite = 5) => {
        setCarregando(true);
        setErro('');
        try {
            const resposta = await axios.get('/api/usuarios', {
                params: { pagina, limite }
            });
            setUsuarios(resposta.data.usuarios);
            setPaginacao(resposta.data.paginacao);
        } catch (erro) {
            const msg = erro.response?.data?.erro || 'Erro ao buscar usuários.';
            setErro(msg);
            setUsuarios([]);
            setPaginacao(null);
        } finally {
            setCarregando(false);
        }
    }, []);

    const limparLista = useCallback(() => {
        setUsuarios([]);
        setPaginacao(null);
        setErro('');
    }, []);

    return (
        <UserContext.Provider value={{
            usuarios,
            paginacao,
            carregando,
            erro,
            buscarUsuarios,
            limparLista
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUsuarios() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUsuarios deve ser usado dentro de UserProvider');
    }
    return context;
}

export default UserContext;