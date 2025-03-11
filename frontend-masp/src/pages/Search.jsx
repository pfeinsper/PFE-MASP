import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../index.css";

export default function Search() {
    const [termo, setTermo] = useState("");
    const [obras, setObras] = useState([]);
    const [sugestoes, setSugestoes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (termo.length > 0) {
            api.get(`/obras?search=${termo}`)
                .then((res) => setSugestoes(res.data))
                .catch((err) => console.error("Erro ao buscar sugestões:", err));
        } else {
            setSugestoes([]);
        }
    }, [termo]);

    const buscarObras = () => {
        api.get(`/obras?search=${termo}`)
            .then((res) => setObras(res.data))
            .catch((err) => console.error("Erro ao buscar obras:", err));
    };

    return (
        <div className="container">
            <h1>Pesquisar Obras</h1>

            {/* Container para input e autocomplete */}
            <div className="autocomplete-container">
                <input
                    type="text"
                    placeholder="Digite o nome ou ID da obra"
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                />

                {/* Lista de sugestões (não ocupa espaço extra na página) */}
                {sugestoes.length > 0 && (
                    <ul className="autocomplete-list">
                        {sugestoes.map((obra) => (
                            <li key={obra.id} onClick={() => setTermo(obra.titulo)}>
                                {obra.titulo}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Botões e resultados abaixo da lista, sem serem empurrados */}
            <div className="content">
                <button onClick={buscarObras}>Buscar</button>

                <ul>
                    {obras.map((obra) => (
                        <li key={obra.id}>{obra.titulo}</li>
                    ))}
                </ul>

                <button onClick={() => navigate("/movimentacao")}>
                    Ir para Movimentação
                </button>
            </div>
        </div>
    );
}
