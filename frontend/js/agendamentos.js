// ============================================================
// js/agendamentos.js — Gerenciamento de Agendamentos (Autenticado)
// ============================================================

const API = 'http://127.0.0.1:8000'
protegerPagina() // Bloqueia a página se não estiver logado

const formAgendamento = document.getElementById('form-agendamento')
const tabelaAgendamentos = document.getElementById('tabela-agendamentos')

// Carrega a lista de agendamentos e preenche a tabela
async function carregarAgendamentos() {
  try {
    const resposta = await fetchAutenticado(`${API}/agendamentos`)
    if (!resposta.ok) throw new Error('Erro ao carregar agendamentos')

    const agendamentos = await resposta.json()
    tabelaAgendamentos.innerHTML = ''

    agendamentos.forEach(ag => {
      // Verifica se tem desenho cadastrado para exibir o botão ou miniatura
      let acaoDesenho = ag.desenho 
        ? `<a href="${API}/static/${ag.desenho}" target="_blank" class="btn btn-sm btn-info">Ver Desenho</a>`
        : `<button onclick="abrirModalDesenho(${ag.idagendamento})" class="btn btn-sm btn-secondary">Add Desenho</button>`

      const linha = document.createElement('tr')
      linha.innerHTML = `
        <td>${ag.idagendamento}</td>
        <td>${ag.cliente_nome || ag.idcliente}</td>
        <td>${ag.tatuador_nome || ag.idtatuador}</td>
        <td>${ag.data_hora}</td>
        <td>R$ ${Number(ag.valor).toFixed(2)}</td>
        <td>${acaoDesenho}</td>
        <td>
          <button onclick="deletarAgendamento(${ag.idagendamento})" class="btn btn-sm btn-danger">Excluir</button>
        </td>
      `
      tabelaAgendamentos.appendChild(linha)
    })
  } catch (erro) {
    console.error('Erro:', erro)
  }
}

// Cadastrar novo agendamento
if (formAgendamento) {
  formAgendamento.addEventListener('submit', async (e) => {
    e.preventDefault()

    const agendamento = {
      idcliente: parseInt(document.getElementById('idcliente').value),
      idtatuador: parseInt(document.getElementById('idtatuador').value),
      data_hora: document.getElementById('data_hora').value,
      valor: parseFloat(document.getElementById('valor').value)
    }

    const resposta = await fetchAutenticado(`${API}/agendamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agendamento)
    })

    if (resposta.ok) {
      formAgendamento.reset()
      carregarAgendamentos()
      alert('Agendamento cadastrado com sucesso!')
    } else {
      const erro = await resposta.json()
      alert('Erro ao cadastrar: ' + JSON.stringify(erro))
    }
  })
}

// Excluir agendamento
async function deletarAgendamento(id) {
  if (confirm('Tem certeza que deseja excluir este agendamento?')) {
    const resposta = await fetchAutenticado(`${API}/agendamentos/${id}`, {
      method: 'DELETE'
    })

    if (resposta.ok) {
      carregarAgendamentos()
    } else {
      alert('Erro ao excluir agendamento.')
    }
  }
}

// Função auxiliar para envio de imagem/desenho (caso sua tela utilize modal ou input específico)
async function enviarDesenho(idagendamento, arquivo) {
  const formData = new FormData()
  formData.append('file', arquivo)

  const resposta = await fetchAutenticado(`${API}/agendamentos/${idagendamento}/desenho`, {
    method: 'POST',
    body: formData // Note que com FormData não definimos 'Content-Type', o navegador faz isso sozinho
  })

  if (resposta.ok) {
    alert('Desenho enviado com sucesso!')
    carregarAgendamentos()
  } else {
    alert('Erro ao enviar desenho.')
  }
}

// Executa ao carregar a página
carregarAgendamentos()