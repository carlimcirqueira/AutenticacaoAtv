import { useState, useEffect } from 'react';
import { useUsuarios } from '../contexts/UserContext';

function ListaUsuarios() {
    const { usuarios, paginacao, carregando, erro, buscarUsuarios, limparLista } = useUsuarios();
    const [mostrar, setMostrar] = useState(false);

    const toggleLista = () => {
        if (mostrar) {
            limparLista();
            setMostrar(false);
        } else {
            setMostrar(true);
        }
    };

    // Carrega a primeira página ao abrir
    useEffect(() => {
        if (mostrar) {
            buscarUsuarios(1);
        }
    }, [mostrar, buscarUsuarios]);

    const handlePagina = (pagina) => {
        buscarUsuarios(pagina, paginacao?.limite || 5);
    };

    return (
        <div className="lista-wrapper">
            <button
                className={`btn-toggle-lista ${mostrar ? 'ativo' : ''}`}
                onClick={toggleLista}
            >
                <span className="btn-icon">
                    {mostrar ? '✕' : '👥'}
                </span>
                {mostrar ? 'Fechar Lista' : 'Ver Usuários Cadastrados'}
            </button>

            {mostrar && (
                <div className="lista-conteudo">
                    <div className="lista-header">
                        <h3>Usuários Cadastrados</h3>
                        <button
                            className="btn-atualizar"
                            onClick={() => buscarUsuarios(paginacao?.pagina || 1)}
                            disabled={carregando}
                            title="Atualizar lista"
                        >
                            ↻
                        </button>
                    </div>

                    {carregando && (
                        <div className="lista-carregando">
                            <div className="spinner"></div>
                            <span>Buscando usuários...</span>
                        </div>
                    )}

                    {erro && (
                        <div className="alerta alerta-erro">{erro}</div>
                    )}

                    {!carregando && !erro && usuarios.length === 0 && (
                        <div className="lista-vazia">
                            <span className="vazia-icon">📭</span>
                            <p>Nenhum usuário cadastrado ainda.</p>
                        </div>
                    )}

                    {!carregando && usuarios.length > 0 && (
                        <>
                            <div className="lista-tabela-wrapper">
                                <table className="lista-tabela">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Nome</th>
                                            <th>E-mail</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuarios.map((user, index) => (
                                            <tr key={user.id}>
                                                <td className="cell-id">
                                                    {(paginacao.pagina - 1) * paginacao.limite + index + 1}
                                                </td>
                                                <td className="cell-nome">{user.nome}</td>
                                                <td className="cell-email">{user.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Paginação */}
                            {paginacao && paginacao.totalPaginas > 1 && (
                                <div className="paginacao">
                                    <button
                                        className="btn-pagina"
                                        onClick={() => handlePagina(1)}
                                        disabled={!paginacao.temAnterior}
                                        title="Primeira página"
                                    >
                                        ««
                                    </button>
                                    <button
                                        className="btn-pagina"
                                        onClick={() => handlePagina(paginacao.pagina - 1)}
                                        disabled={!paginacao.temAnterior}
                                        title="Página anterior"
                                    >
                                        «
                                    </button>

                                    <span className="paginacao-info">
                                        Página {paginacao.pagina} de {paginacao.totalPaginas}
                                        <small> ({paginacao.total} registros)</small>
                                    </span>

                                    <button
                                        className="btn-pagina"
                                        onClick={() => handlePagina(paginacao.pagina + 1)}
                                        disabled={!paginacao.temProxima}
                                        title="Próxima página"
                                    >
                                        »
                                    </button>
                                    <button
                                        className="btn-pagina"
                                        onClick={() => handlePagina(paginacao.totalPaginas)}
                                        disabled={!paginacao.temProxima}
                                        title="Última página"
                                    >
                                        »»
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default ListaUsuarios;