const API = 'http://127.0.0.1:8000'
protegerPagina() // Bloqueia se não estiver logado

const formCadastro = document.getElementById('form-cadastro')

formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault()

  const usuario = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    senha: document.getElementById('senha').value
  }

  const resposta = await fetchAutenticado(`${API}/usuarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(usuario)
  })

  if (resposta.ok) {
    alert('Funcionário cadastrado com sucesso!')
    window.location.href = 'dashboard.html'
  } else {
    const erro = await resposta.json()
    alert('Erro ao cadastrar: ' + JSON.stringify(erro))
  }
})