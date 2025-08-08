import { useState, useEffect } from 'react'
import '../design/DraggableNotes.css'

function DraggableNotesList({ 
    notes, 
    editingId, 
    editTitle, 
    editBody,
    setEditTitle,
    setEditBody,
    setEditingId,
    setViewingNote,
    handleEdit,
    updateNote,
    deleteNote 
}) {
    const [draggedIndex, setDraggedIndex] = useState(null)
    const [draggedOverIndex, setDraggedOverIndex] = useState(null)
    const [orderedNotes, setOrderedNotes] = useState(notes)

    useEffect(() => {
        setOrderedNotes(notes)
    }, [notes])

    const handleDragStart = (e, index) => {
        setDraggedIndex(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e, index) => {
        e.preventDefault()
        setDraggedOverIndex(index)
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDragLeave = () => {
        setDraggedOverIndex(null)
    }

    const handleDrop = (e, dropIndex) => {
        e.preventDefault()
        
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null)
            setDraggedOverIndex(null)
            return
        }

        const newNotes = [...orderedNotes]
        const draggedNote = newNotes[draggedIndex]
        
        newNotes.splice(draggedIndex, 1)

        newNotes.splice(dropIndex, 0, draggedNote)
        
        setOrderedNotes(newNotes)
        setDraggedIndex(null)
        setDraggedOverIndex(null)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
        setDraggedOverIndex(null)
    }

    if (orderedNotes.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">📝</div>
                <div>Notes you add appear here</div>
            </div>
        )
    }

    return (
        <div className="draggable-notes-grid">
            {orderedNotes.map((note, index) => (
                <div
                    key={note._id}
                    className={`draggable-note-card ${
                        draggedIndex === index ? 'dragging' : ''
                    } ${
                        draggedOverIndex === index ? 'drag-over' : ''
                    }`}
                    draggable={editingId !== note._id}
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setViewingNote(note)}
                >
                    <div className="drag-handle">
                        <span className="drag-dots">⋮⋮</span>
                    </div>
                    
                    {editingId === note._id ? (
                        <form onSubmit={updateNote} className="edit-form" onClick={(e) => e.stopPropagation()}>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                required
                                className="edit-input"
                            />
                            <textarea
                                value={editBody}
                                onChange={e => setEditBody(e.target.value)}
                                className="edit-textarea"
                            />
                            <div className="edit-actions">
                                <button type="submit" className="btn-small btn-save">
                                    ✓ Save
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setEditingId(null)}
                                    className="btn-small btn-cancel"
                                >
                                    ✕ Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="note-content">
                                <h3 className="note-title">{note.title}</h3>
                                <p className="note-body">{note.body}</p>
                                
                                {note.image && (
                                    <div className="note-media">
                                        <img 
                                            src={note.image} 
                                            alt="Note attachment"
                                            className="note-image"
                                        />
                                    </div>
                                )}
                                
                                {note.drawing && (
                                    <div className="note-media">
                                        <img 
                                            src={note.drawing} 
                                            alt="Note drawing"
                                            className="note-drawing"
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div className="note-actions" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    onClick={() => handleEdit(note._id)}
                                    className="btn-icon"
                                >
                                    ✏️
                                </button>
                                <button 
                                    onClick={() => deleteNote(note._id)}
                                    className="btn-icon btn-danger"
                                >
                                    🗑️
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
        </div>
    )
}

export default DraggableNotesList