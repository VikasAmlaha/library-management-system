import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  // --- Data state: what's currently in the database, as far as our UI knows ---
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  // --- Form state: what the user is currently typing ---
  // These are "controlled inputs" — React state is the single source of truth
  // for what's in each box, not the browser itself.
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [copies, setCopies] = useState(1)

  // Tracks whether the form is in "add" mode (null) or "edit" mode (a book's id).
  // One form handles both jobs instead of building two separate UIs.
  const [editingId, setEditingId] = useState(null)

  // Fetches the current book list from Supabase and stores it in state.
  // Called once on page load, and again after every insert/update/delete,
  // since Supabase doesn't automatically push changes into our React state.
  async function fetchBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title')

    if (error) console.error(error)
    else setBooks(data)
    setLoading(false)
  }

  // Empty dependency array [] means "run this once, when the component first mounts."
  useEffect(() => {
    fetchBooks()
  }, [])

  // Clears the form back to its default, blank, "add mode" state.
  function resetForm() {
    setTitle('')
    setAuthor('')
    setCopies(1)
    setEditingId(null)
  }

  // Handles both adding a new book AND updating an existing one,
  // depending on whether editingId is set.
  async function handleSubmit(e) {
    e.preventDefault() // stops the browser's default full-page-reload form behavior

    if (editingId) {
      // EDIT MODE: update the existing row that matches editingId
      const { error } = await supabase
        .from('books')
        .update({ title, author, total_copies: copies })
        .eq('id', editingId)

      if (error) { console.error(error); return }
    } else {
      // ADD MODE: insert a new row.
      // available_copies starts equal to total_copies since a brand-new
      // book hasn't been borrowed by anyone yet.
      const { error } = await supabase.from('books').insert({
        title,
        author,
        total_copies: copies,
        available_copies: copies,
      })

      if (error) { console.error(error); return }
    }

    resetForm()
    fetchBooks() // refresh the list so the UI reflects the database
  }

  // Pre-fills the form with an existing book's data and switches to edit mode.
  function handleEditClick(book) {
    setTitle(book.title)
    setAuthor(book.author)
    setCopies(book.total_copies)
    setEditingId(book.id)
  }

  // Deletes a book after a confirmation prompt.
  // window.confirm() is deliberately used here (even though it's a plain
  // browser popup) because delete is irreversible — it's the one action
  // in this app that should have friction before it happens.
  async function handleDelete(id) {
    const confirmed = window.confirm('Delete this book?')
    if (!confirmed) return

    const { error } = await supabase.from('books').delete().eq('id', id)
    if (error) { console.error(error); return }
    fetchBooks()
  }

  // Show a simple loading state while the first fetch is in flight,
  // so the UI doesn't flash an empty list before data arrives.
  if (loading) return <p>Loading...</p>

  return (
    <div className="container">
      {/* Institutional letterhead — this is CONTEXT, not the page's main heading.
          Kept visually smaller than <h1> on purpose (see CSS notes below). */}
      <header className="letterhead">
        <p className="college-name">
          Chandra Shekhar Azad Government Post Graduate College, Sehore (M.P.)
        </p>
        <p className="dept-name">Department of English</p>
      </header>

      {/* The real page heading — a page should have exactly one <h1>,
          and it should describe what the page IS, not who hosts it. */}
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
        {/* Button label changes based on mode, so the UI always tells the
            user what action they're about to take. */}
        <button type="submit">
          {editingId ? 'Update Book' : 'Add Book'}
        </button>

        {/* Cancel button only appears while editing, to back out without saving */}
        {editingId && (
          <button type="button" onClick={resetForm} className="cancel-btn">
            Cancel
          </button>
        )}
      </form>

      <ul>
        {books.map(book => (
          // key={book.id} helps React efficiently track which list item is which
          // across re-renders — required whenever you render a list from an array.
          <li key={book.id}>
            <span>
              {book.title} — {book.author} ({book.available_copies}/{book.total_copies} available)
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