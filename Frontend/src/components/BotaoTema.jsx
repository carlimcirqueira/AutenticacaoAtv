import { useTema } from '../contexts/ThemeContext';

function BotaoTema() {
    const { tema, alternarTema } = useTema();

    return (
        <button
            className="btn-tema"
            onClick={alternarTema}
            title={tema === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
            <span className="btn-tema-icon">
                {tema === 'dark' ? '☀️' : '🌙'}
            </span>
            <span className="btn-tema-texto">
                {tema === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
            </span>
        </button>
    );
}

export default BotaoTema;