import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [copies, setCopies] = useState(1)
  const [editingId, setEditingId] = useState(null)

  async function fetchBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title')

    if (error) console.error(error)
    else setBooks(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  function resetForm() {
    setTitle('')
    setAuthor('')
    setCopies(1)
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (editingId) {
      // UPDATE existing book
      const { error } = await supabase
        .from('books')
        .update({ title, author, total_copies: copies })
        .eq('id', editingId)

      if (error) { console.error(error); return }
    } else {
      // INSERT new book
      const { error } = await supabase.from('books').insert({
        title,
        author,
        total_copies: copies,
        available_copies: copies,
      })

      if (error) { console.error(error); return }
    }

    resetForm()
    fetchBooks()
  }

  function handleEditClick(book) {
    setTitle(book.title)
    setAuthor(book.author)
    setCopies(book.total_copies)
    setEditingId(book.id)
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this book?')
    if (!confirmed) return

    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) { console.error(error); return }
    fetchBooks()
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="container">
      <h1>Library Catalog</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          required
        />
        <input
          type="number"
          value={copies}
          onChange={(e) => setCopies(Number(e.target.value))}
          min="1"
        />
        <button type="submit">
          {editingId ? 'Update Book' : 'Add Book'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} className="cancel-btn">
            Cancel
          </button>
        )}
      </form>

      <ul>
        {books.map(book => (
          <li key={book.id}>
            <span>
              {book.title} — {book.author} ({book.available_copies}/{book.total_copies} available)
            </span>
            <div className="row-actions">
              <button onClick={() => handleEditClick(book)}>Edit</button>
              <button onClick={() => handleDelete(book.id)} className="delete-btn">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App