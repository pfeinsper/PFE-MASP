import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

// Agora enviamos todos os parâmetros no body
export const registrarMovimentacao = async (
  obra_id,
  local_id,
  usuario_id,
  tipo_movimentacao
) => {
  try {
    const response = await api.post("/movimentacoes", {
      obra_id,
      local_id,
      usuario_id,
      tipo_movimentacao
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao registrar movimentação:", error);
    throw error;
  }
};

export default api;
