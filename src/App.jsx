import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [category, setCategory] = useState('')
  // "copies" is a UI convenience only — it does NOT get stored as a column.
  // Instead, it controls how many separate rows (one per physical copy)
  // get inserted, each getting its own auto-generated accession number.
  const [copies, setCopies] = useState(1)

  const [editingId, setEditingId] = useState(null)

  async function fetchBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('accession_no')

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
    setGenre('')
    setCategory('')
    setCopies(1)
    setEditingId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (editingId) {
      // EDIT MODE: this is always exactly one row — a specific physical
      // copy — so "copies" doesn't apply here at all.
      const { error } = await supabase
        .from('books')
        .update({ title, author, genre, category })
        .eq('id', editingId)

      if (error) { console.error(error); return }
    } else {
      // ADD MODE: build an array with one object per physical copy.
      // accession_no and is_available are left out entirely — the
      // database fills those in automatically (sequence + default true).
      const rows = Array.from({ length: copies }, () => ({
        title,
        author,
        genre,
        category,
      }))

      // Supabase's insert() accepts an array directly for a bulk insert —
      // this creates all copies in a single request instead of looping
      // and calling insert() multiple times.
      const { error } = await supabase.from('books').insert(rows)

      if (error) { console.error(error); return }
    }

    resetForm()
    fetchBooks()
  }

  function handleEditClick(book) {
    setTitle(book.title)
    setAuthor(book.author)
    setGenre(book.genre || '')
    setCategory(book.category || '')
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
      <header className="letterhead">
        <p className="college-name">
          Chandra Shekhar Azad Government Post Graduate College, Sehore (M.P.)
        </p>
        <p className="dept-name">Department of English</p>
      </header>

      <h1>Library Catalog</h1>

      <form onSubmit={handleSubmit}>
        <input
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
        <input
          className="author-input"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Author"
          required
        />
        <input
          className="genre-input"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          placeholder="Genre"
        />

        {/* A <datalist> gives typeahead suggestions from known categories,
            while still letting you type anything new — the same
            "flexible, not locked-down" choice we made in the database. */}
        <input
          className="category-input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          list="category-options"
        />
        <datalist id="category-options">
          <option value="Book Bank" />
          <option value="Govt" />
          <option value="UGC" />
        </datalist>

        {/* Copies only makes sense when adding new books, not when
            editing one existing copy — so it's hidden in edit mode. */}
        {!editingId && (
          <input
            className="copies-input"
            type="number"
            value={copies}
            onChange={(e) => setCopies(Number(e.target.value))}
            min="1"
            title="Number of physical copies to add"
          />
        )}

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
              <strong>{book.accession_no}</strong> — {book.title} — {book.author}
              {book.genre && ` · ${book.genre}`}
              {book.category && ` · ${book.category}`}
              {' '}
              <em>{book.is_available ? '(Available)' : '(Borrowed)'}</em>
            </span>
            <div className="row-actions">
              <button onClick={() => handleEditClick(book)}>Edit</button>
              <button onClick={() => handleDelete(book.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App