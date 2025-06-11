import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

// Interceptor que adiciona o Bearer token em cada requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function registrarMovimentacao(obra_id, local_id, tipo_movimentacao, notasAdicionais) {
  try {
    const response = await api.post("/movimentacoes", {
      obra_id,
      local_id,
      tipo_movimentacao,
      notas_adicionais: notasAdicionais
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error);
    throw error;
  }
}

export default api;