
// const baseUrl = 'http://localhost:3000'
const baseUrl = 'https://todoapp-mongoose-api.onrender.com'
const allTodosContainer = $('#allTodosContainer')
const input = $('#textInput')

$(document).ready(() => {
  refreshTodos()
})

async function refreshTodos() {
  allTodosContainer.prepend(`
    <div class="d-flex justify-content-center">
      <div id="loading" class="spinner-border text-primary"></div>
    </div>
  `)

  const todos = await fetchHandler(`${baseUrl}/api/todos`)

  if(todos && todos.length) {
    allTodosContainer.html(todos.map(todo => generateTodoHtml(todo)).join(''))
  } else {
    allTodosContainer.html('<p class="text-center">There is no todos</p>')
  }
}

async function addHandler() {
  const text = input.val().trim()
  if(text) {
    const result = await fetchHandler(`${baseUrl}/api/todos`, {
      method: 'POST',
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" }
    })
    input.val('')
    if(result) refreshTodos()
  }
}

async function editHandler(id, checkbox) {
  let update
  if(checkbox) {
    update = { completed: checkbox.checked }
  } else {
    const text = input.val().trim()
    if(text) {
      update = { text }
      changeEditToAdd()
    }
  }

  const result = await fetchHandler(`${baseUrl}/api/todos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(update),
    headers: { "Content-Type": "application/json" }
  })
  if(result) refreshTodos()
}

async function deleteHandler(id) {
  const result = await fetchHandler(`${baseUrl}/api/todos/${id}`, {
    method: 'DELETE',
    headers: { "Content-Type": "application/json" }
  })
  if(result) refreshTodos()
}

async function fetchHandler(url, requestOptions) {
  try {
    const response = await fetch(url, requestOptions)
    const result = await response.json()

    if(response.ok) {
      console.log("result: ", result)
      return result
    }
  } catch (err) {
    console.error('Error fetching: ', err)
  }
}

function changeAddToEdit(id, text) {
  let btn = $('#addEditBtn')
  btn.text('Edit')
  btn.attr('onclick', `editHandler('${id}')`)
  btn.removeClass('btn-outline-primary')
  btn.addClass('btn-outline-success')

  input.val(text)
  $('#cancelBtn').removeClass('d-none')
}

function changeEditToAdd() {
  let btn = $('#addEditBtn')
  btn.text('Add')
  btn.attr('onclick', 'addHandler()')
  btn.removeClass('btn-outline-success')
  btn.addClass('btn-outline-primary')

  input.val('')
  $('#cancelBtn').addClass('d-none')
}

function generateTodoHtml({ _id, text, completed }) {
  return (`
    <div class='input-group rounded mt-3'>
      <div class="input-group-text">
        <input type="checkbox" ${completed && 'checked'}
          onchange="editHandler('${_id}', this)"
          class="form-check-input border border-primary"> 
      </div>
      <span class="${completed && 'text-decoration-line-through'} input-group-text col text-wrap text-break text-start">${text}</span>
      <button type="button" onclick="changeAddToEdit('${_id}', '${text}')" class="btn btn-outline-success"><i class="bi bi-pencil-square"></i></button>
      <button type="button" onclick="deleteHandler('${_id}')" class="btn btn-outline-danger"><i class="bi bi-x-lg"></i></button>
    </div>
  `)
}
