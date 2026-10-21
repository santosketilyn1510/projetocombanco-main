const API = 'http://127.0.0.1:8000'
const formTatuador = document.getElementById('form-tatuador')
const botaoSubmit = document.getElementById('btn-submit-tatuador')

function limparFormulario() {
  formTatuador.reset()
  delete formTatuador.dataset.idTatuador
  botaoSubmit.textContent = 'Cadastrar'
  botaoSubmit.classList.remove('btn-success')
  botaoSubmit.classList.add('btn-primary')
}

async function carregarSenioridades() {
  const resposta = await fetch(`${API}/senioridade`)
  const senioridades = await resposta.json()
  const select = document.getElementById('idsenioridade')
  select.innerHTML = '<option value="">Senioridade...</option>'

  senioridades.forEach(s => {
    select.innerHTML += `<option value="${s.idsenioridade}">${s.nome}</option>`
  })
}

carregarSenioridades()

async function listarTatuadores() {
  const resposta = await fetch(`${API}/tatuadores`)
  const tatuadores = await resposta.json()
  const corpo = document.getElementById('corpo-tabela')
  corpo.innerHTML = ''

  tatuadores.forEach(t => {
    corpo.innerHTML += `
      <tr>
        <td>${t.idtatuador}</td>
        <td>${t.nometatuador}</td>
        <td>${t.cpf}</td>
        <td>${t.email ?? '-'}</td>
        <td>${t.telefone ?? '-'}</td>
        <td>${t.senioridade}</td>
        <td>${t.estilos ?? '-'}</td>
        <td>
          <button class="btn btn-sm btn-warning me-2" onclick='preencherFormularioEdicao(${JSON.stringify(t)})'>Editar</button>
          <button class="btn btn-sm btn-danger" onclick="deletarTatuador(${t.idtatuador})">Excluir</button>
        </td>
      </tr>`
  })
}

listarTatuadores()

formTatuador.addEventListener('submit', async (e) => {
  e.preventDefault()

  const tatuador = {
    nometatuador: document.getElementById('nometatuador').value,
    cpf: document.getElementById('cpf').value,
    email: document.getElementById('email').value || null,
    telefone: document.getElementById('telefone').value || null,
    datacontratacao: new Date().toISOString().split('T')[0],
    idsenioridade: Number(document.getElementById('idsenioridade').value)
  }

  const idTatuador = formTatuador.dataset.idTatuador
  let idParaEstilos = idTatuador

  if (idTatuador) {
    await fetch(`${API}/tatuadores/${idTatuador}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tatuador)
    })
  } else {
    const resposta = await fetch(`${API}/tatuadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tatuador)
    })
    const dados = await resposta.json()
    idParaEstilos = dados.idtatuador
  }

  const idsMarcados = Array.from(document.querySelectorAll('#lista-estilos input:checked'))
    .map(checkbox => Number(checkbox.value))

  await fetch(`${API}/tatuadores/${idParaEstilos}/estilos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idestilos: idsMarcados })
  })

  limparFormulario()
  listarTatuadores()
})

async function preencherFormularioEdicao(tatuador) {
  document.getElementById('nometatuador').value = tatuador.nometatuador
  document.getElementById('cpf').value = tatuador.cpf
  document.getElementById('email').value = tatuador.email || ''
  document.getElementById('telefone').value = tatuador.telefone || ''
  document.getElementById('idsenioridade').value = tatuador.idsenioridade

  formTatuador.dataset.idTatuador = tatuador.idtatuador

  document.querySelectorAll('#lista-estilos input').forEach(cb => cb.checked = false)

  const resposta = await fetch(`${API}/tatuadores/${tatuador.idtatuador}/estilos`)
  const estilosDoTatuador = await resposta.json()
  estilosDoTatuador.forEach(e => {
    const checkbox = document.getElementById(`estilo-${e.idestilo}`)
    if (checkbox) checkbox.checked = true
  })

  botaoSubmit.textContent = 'Salvar alteração'
  botaoSubmit.classList.remove('btn-primary')
  botaoSubmit.classList.add('btn-success')
}

carregarEstilos()