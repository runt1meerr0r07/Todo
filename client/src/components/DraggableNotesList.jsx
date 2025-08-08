import { useState, useEffect, useRef } from 'react'
import '../design/DraggableNotes.css'
import API_BASE_URL from '../config.js'

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
    const [orderedNotes, setOrderedNotes] = useState([])
    const lastNotesLength = useRef(0)

    useEffect(() => {
        if (notes && notes.length > 0) {
            const shouldResort = orderedNotes.length === 0 || notes.length !== lastNotesLength.current;
            
            if (shouldResort) {
                const sortedNotes = [...notes].sort((a, b) => {
                    const posA = a.position !== undefined ? a.position : 999999
                    const posB = b.position !== undefined ? b.position : 999999
                    if (posA === posB) {
                        return new Date(a.createdAt) - new Date(b.createdAt)
                    }
                    return posA - posB
                })
                
                setOrderedNotes(sortedNotes)
            } else {
                setOrderedNotes(prev => 
                    prev.map(orderedNote => {
                        const updatedNote = notes.find(n => n._id === orderedNote._id)
                        return updatedNote || orderedNote
                    })
                )
            }
            
            lastNotesLength.current = notes.length
        } else {
            setOrderedNotes([])
            lastNotesLength.current = 0
        }
    }, [notes])

    const savePositionsToBackend = async (positions) => {
        try {
            const notePositions = positions.map((note, index) => ({
                id: note._id,
                position: index
            }));

            const token = localStorage.getItem('authToken');
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/notes/update-positions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ notePositions })
            });

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    // Response might not be JSON
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

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

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault()
        
        if (draggedIndex === null || draggedIndex === dropIndex || !orderedNotes.length) {
            setDraggedIndex(null)
            setDraggedOverIndex(null)
            return
        }

        const newNotes = [...orderedNotes]
        const draggedNote = newNotes[draggedIndex]

        
        newNotes.splice(draggedIndex, 1)
        newNotes.splice(dropIndex, 0, draggedNote)
       
        setOrderedNotes(newNotes)

        await savePositionsToBackend(newNotes)
        
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
                    onClick={() => {
                        // Only open modal if not editing
                        if (editingId !== note._id) {
                            setViewingNote(note)
                        }
                    }}
                >
                    <div className="drag-handle">
                        <div className="drag-dots">
                            <span>⋮⋮</span>
                        </div>
                    </div>
                    
                    {editingId === note._id ? (
                        <div 
                            className="note-edit-form"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="edit-title"
                                placeholder="Note title..."
                                onClick={(e) => e.stopPropagation()}
                            />
                            <textarea
                                value={editBody}
                                onChange={(e) => setEditBody(e.target.value)}
                                className="edit-body"
                                placeholder="Note content..."
                                rows="4"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="edit-actions">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        updateNote(note._id)
                                    }}
                                    className="save-btn"
                                >
                                    Save
                                </button>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingId(null)
                                    }}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="note-content">
                            <h3 className="note-title">{note.title}</h3>
                            <p className="note-body">{note.body}</p>
                            
                            {/* Images and drawings in grid */}
                            {note.image && (
                                <div className="note-media">
                                    <img 
                                        src={note.image} 
                                        alt="Note attachment" 
                                        className="note-image"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            )}
                            
                            {note.drawing && (
                                <div className="note-media">
                                    <img 
                                        src={note.drawing} 
                                        alt="Note drawing" 
                                        className="note-drawing"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            )}
                            
                            <div className="note-actions">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleEdit(note._id)
                                    }}
                                    className="btn-icon edit-btn"
                                    title="Edit note"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        deleteNote(note._id)
                                    }}
                                    className="btn-icon delete-btn"
                                    title="Delete note"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default DraggableNotesList