import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

// Função para registrar movimentação
export const registrarMovimentacao = async (obra_id, local_id) => {
  try {
    const response = await api.post("/movimentacoes", { obra_id, local_id });
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error);
    throw error;
  }
};

export default api;
