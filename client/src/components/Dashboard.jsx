import { useState, useEffect, useRef } from 'react'
import '../design/Dashboard.css'
import API_BASE_URL from '../config.js'
import DraggableNotesList from './DraggableNotesList.jsx'

function Dashboard({ onLogout }) {
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editTitle, setEditTitle] = useState('')
    const [editBody, setEditBody] = useState('')
    const [showProfile, setShowProfile] = useState(false)
    const [darkMode, setDarkMode] = useState(true)
    const [showCanvas, setShowCanvas] = useState(false)
    const [selectedImage, setSelectedImage] = useState(null)
    const [viewingNote, setViewingNote] = useState(null)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('') 
    
    const canvasRef = useRef(null)
    const isDrawing = useRef(false)
    const fileInputRef = useRef(null)

    const getTheme = async() => {
        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`${API_BASE_URL}/user/theme`, {
                method:'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials:'include'
            })
            const data = await response.json()
            if(data.success) {
                setDarkMode(data.darkMode);
            }
        } 
        catch (error) {
            setDarkMode(true);
            console.log("Error getting theme", error)
        }
    }

    const saveTheme = async (darkMode) => {
        try {
            const token = localStorage.getItem('authToken');
            
            await fetch(`${API_BASE_URL}/user/theme`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ darkMode })
            });
        } catch (error) {
            console.log(error)
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const newMode = !prev;
            saveTheme(newMode);
            return newMode;
        });
    };
    

    useEffect(()=>{
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    },[darkMode,setDarkMode])

    useEffect(() => {
        getTheme();
    }, []);
    
    const handleImageClick = () => fileInputRef.current?.click()

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => setSelectedImage(e.target.result)
            reader.readAsDataURL(file)
        }
    }

    const removeSelectedImage = () => {
        setSelectedImage(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const getCanvasCoords = (e) => {
        const canvas = canvasRef.current
        const rect = canvas.getBoundingClientRect()
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        }
    }

    const startDrawing = (e) => {
        isDrawing.current = true
        const { x, y } = getCanvasCoords(e)
        const ctx = canvasRef.current.getContext('2d')
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const draw = (e) => {
        if (!isDrawing.current) return
        const { x, y } = getCanvasCoords(e)
        const ctx = canvasRef.current.getContext('2d')
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.strokeStyle = darkMode ? '#e8eaed' : '#202124'
        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const stopDrawing = () => isDrawing.current = false

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    const createNote = async (e) => {
        e.preventDefault()
        if (!title && !body && !selectedImage && !showCanvas) {
            alert('Please add some content')
            return
        }

        let drawingData = null
        if (showCanvas && canvasRef.current) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const hasDrawing = imageData.data.some((pixel, index) => 
                index % 4 !== 3 && pixel !== 255
            )
            if (hasDrawing) drawingData = canvas.toDataURL()
        }
        
        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`${API_BASE_URL}/notes/create-note`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ 
                    title: title || 'Untitled', 
                    body: body || '',
                    drawing: drawingData,
                    image: selectedImage 
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            if (data.success) {
                setTitle('')
                setBody('')
                setShowCanvas(false)
                setSelectedImage(null)
                if (canvasRef.current) clearCanvas()
                if (fileInputRef.current) fileInputRef.current.value = ''
                fetchNotes()
                showMessage('Note created successfully!', 'success')
            }
        } catch (error) {
            console.log('Error creating note:', error)
            showMessage('Failed to create note. Please try again.', 'error')
        }
    }

    const fetchNotes = async () => {
        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`${API_BASE_URL}/notes/get-notes`, {
                method: 'GET',  
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) setNotes(data.data)
        } catch (error) {
            console.log('Error fetching notes:', error)
            showMessage('Failed to load notes. Please refresh the page.', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    const handleEdit = (noteId) => {
        const noteToEdit = notes.find(note => note._id === noteId)
        setEditingId(noteId)
        setEditTitle(noteToEdit.title)
        setEditBody(noteToEdit.body)
    }

    const updateNote = async (e) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`${API_BASE_URL}/notes/${editingId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include',
                body: JSON.stringify({ newTitle: editTitle, newBody: editBody })
            })
            const data = await response.json()
            if (data.success) {
                setEditTitle('')
                setEditBody('')
                setEditingId(null)
                fetchNotes()
                showMessage('Note updated successfully!', 'success')
            } else {
                showMessage('Failed to update note', 'error')
            }
        } catch (error) {
            console.log('Error updating note:', error)
            showMessage('Error updating note', 'error')
        }
    }

    const deleteNote = async (noteId) => {
        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            const data = await response.json()
            if (data.success) {
                fetchNotes()
                showMessage('Note deleted successfully!', 'success')
            }
        } catch (error) {
            console.log('Error deleting note:', error)
            showMessage('Error deleting note', 'error')
        }
    }

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('authToken');
            
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
        } catch (error) {
            console.log('Logout error:', error)
        } finally {
            localStorage.removeItem('authToken');
            localStorage.removeItem('theme');
            onLogout()
        }
    }

    const showMessage = (text, type = 'info') => {
        setMessage(text)
        setMessageType(type)
        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 4000)
    }

    const hideMessage = () => {
        setMessage('')
        setMessageType('')
    }

    return (
        <div className="dashboard-container">
            <header className="header">
                <h1>📋 Notes</h1>
                <div className="header-actions">
                    <button 
                        className="theme-toggle"
                        onClick={toggleDarkMode}
                        title={darkMode ? 'Light mode' : 'Dark mode'}
                    >
                        {darkMode ? '☀️' : '🌙'}
                    </button>
                    
                    <div className="profile-container">
                        <button 
                            className="profile-button"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            👤
                        </button>
                        
                        {showProfile && (
                            <div className="profile-dropdown">
                                <button className="profile-menu-item logout" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {message && (
                <div className={`message-toast message-${messageType}`}>
                    <span className="message-text">{message}</span>
                    <button 
                        className="message-close" 
                        onClick={hideMessage}
                        aria-label="Close message"
                    >
                        ✕
                    </button>
                </div>
            )}

            <main className="main-content">
                <div className="note-form">
                    <form onSubmit={createNote}>
                        <input
                            type="text"
                            placeholder="Take a note..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="note-input"
                        />
                        <textarea
                            placeholder="Task"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="note-textarea"
                        />
                        
                        {selectedImage && (
                            <div className="image-preview">
                                <img src={selectedImage} alt="Selected" className="preview-image" />
                                <button 
                                    type="button" 
                                    onClick={removeSelectedImage}
                                    className="remove-image-btn"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                        
                        {showCanvas && (
                            <div className="canvas-container">
                                <canvas
                                    ref={canvasRef}
                                    width={560}
                                    height={200}
                                    className="drawing-canvas"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                />
                                <div className="canvas-tools">
                                    <button 
                                        type="button" 
                                        onClick={clearCanvas}
                                        className="tool-btn"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="form-actions">
                            <div className="form-tools">
                                <button 
                                    type="button" 
                                    className="tool-btn"
                                    onClick={() => setShowCanvas(!showCanvas)}
                                >
                                    🎨
                                </button>
                                <button 
                                    type="button" 
                                    className="tool-btn"
                                    onClick={handleImageClick}
                                >
                                    🖼️
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <button type="submit" className="btn-primary">
                                Add Note
                            </button>
                        </div>
                    </form>
                </div>

                {loading ? (
                    <div className="loading-state">Loading notes...</div>
                ) : (
                    <DraggableNotesList
                        notes={notes}
                        editingId={editingId}
                        editTitle={editTitle}
                        editBody={editBody}
                        setEditTitle={setEditTitle}
                        setEditBody={setEditBody}
                        setEditingId={setEditingId}
                        setViewingNote={setViewingNote}
                        handleEdit={handleEdit}
                        updateNote={updateNote}
                        deleteNote={deleteNote}
                    />
                )}
            </main>

            {viewingNote && (
                <div className="modal-overlay" onClick={() => setViewingNote(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="modal-close"
                            onClick={() => setViewingNote(null)}
                        >
                            ✕
                        </button>
                        <h2 className="modal-title">{viewingNote.title}</h2>
                        <p className="modal-body">{viewingNote.body}</p>
                        
                        {viewingNote.image && (
                            <div className="modal-media">
                                <img 
                                    src={viewingNote.image} 
                                    alt="Note attachment"
                                    className="modal-image"
                                />
                            </div>
                        )}
                        
                        {viewingNote.drawing && (
                            <div className="modal-media">
                                <img 
                                    src={viewingNote.drawing} 
                                    alt="Note drawing"
                                    className="modal-drawing"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard