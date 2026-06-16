import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';

function FormularioCadastro() {
    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();

    // Estado para controlar mensagens de erro ou sucesso na tela (melhor que usar alert)
    const [status, setStatus] = useState({ tipo: '', mensagem: '' });

    // Monitora o que está sendo digitado no campo "senha" para a validação de confirmação
    const senhaDigitada = watch('senha');

    const onSubmit = async (dados) => {
        setStatus({ tipo: '', mensagem: '' }); // Limpa mensagens anteriores

        try {
            const resposta = await axios.post('https://autenticacaoatv.onrender.com', dados);
            setStatus({ tipo: 'sucesso', mensagem: resposta.data.mensagem || 'Cadastro realizado com sucesso!' });
            reset(); // Limpa o formulário
        } catch (erro) {
            const msgErro = erro.response?.data?.erro || 'Erro de conexão com o servidor.';
            setStatus({ tipo: 'erro', mensagem: msgErro });
        }
    };

    return (
        <div className="formulario-box">
            <h2>Cadastro de Usuário</h2>

            {/* Exibe as mensagens de erro ou sucesso vindas do backend */}
            {status.mensagem && (
                <div className={`alerta ${status.tipo === 'sucesso' ? 'alerta-sucesso' : 'alerta-erro'}`}>
                    {status.mensagem}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>

                <div className="campo-grupo">
                    <label htmlFor="nome">Nome Completo</label>
                    <input
                        id="nome"
                        type="text"
                        {...register("nome", { required: "O nome é obrigatório." })}
                    />
                    {errors.nome && <span className="erro-mensagem">{errors.nome.message}</span>}
                </div>

                <div className="campo-grupo">
                    <label htmlFor="email">E-mail</label>
                    <input
                        id="email"
                        type="email"
                        {...register("email", {
                            required: "O e-mail é obrigatório.",
                            pattern: {
                                value: /^\S+@\S+\.\S+$/,
                                message: "Insira um formato de e-mail válido."
                            }
                        })}
                    />
                    {errors.email && <span className="erro-mensagem">{errors.email.message}</span>}
                </div>

                <div className="campo-grupo">
                    <label htmlFor="senha">Senha</label>
                    <input
                        id="senha"
                        type="password"
                        {...register("senha", {
                            required: "A senha é obrigatória.",
                            minLength: { value: 5, message: "A senha deve ter no mínimo 8 caracteres." }
                        })}
                    />
                    {errors.senha && <span className="erro-mensagem">{errors.senha.message}</span>}
                </div>

                <div className="campo-grupo">
                    <label htmlFor="confirmarSenha">Confirme a Senha</label>
                    <input
                        id="confirmarSenha"
                        type="password"
                        {...register("confirmarSenha", {
                            required: "A confirmação de senha é obrigatória.",
                            validate: (valor) => valor === senhaDigitada || "As senhas não coincidem."
                        })}
                    />
                    {errors.confirmarSenha && <span className="erro-mensagem">{errors.confirmarSenha.message}</span>}
                </div>

                <button type="submit" className="btn-cadastrar">Cadastrar</button>
            </form>
        </div>
    );
}

export default FormularioCadastro;