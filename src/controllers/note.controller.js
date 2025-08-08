import { Note } from "../models/note.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const createNote = async(req,res) => {
    try {
        console.log('Creating note with data:', req.body);
        console.log('User ID:', req.user?.id);
        
        const {title, body, image, drawing} = req.body
        const userId = req.user.id

     
        const hasTitle = title && title.trim() !== '';
        const hasBody = body && body.trim() !== '';
        const hasImage = image;
        const hasDrawing = drawing;

        if (!hasTitle && !hasBody && !hasImage && !hasDrawing) {
            return res.status(400).json({
                success: false,
                message: "Please add some content to your note"
            })
        }

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }

        const noteCount = await Note.countDocuments({ owner: userId })
        const nextPosition = noteCount 

        console.log(`Creating note at position ${nextPosition} for user ${userId}`);

        const note = await Note.create({
            title: hasTitle ? title.trim() : 'Untitled',  
            body: hasBody ? body.trim() : '',             
            image: image || null,
            drawing: drawing || null,
            position: nextPosition,
            owner: userId
        })

        console.log('Note created successfully:', note._id);

        return res.status(201).json({
            success: true,
            message: "Note created successfully",
            data: note
        })
    } 
    catch (error) 
    {
        console.error('Create note error:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: "Failed to create note",
            error: error.message
        })
    }
}

const getNotes = async (req, res) => {
    try {
        const userId = req.user.id
        console.log('Getting notes for user:', userId);
    
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }
        
        let notes = await Note.find({ owner: userId })

        const notesNeedingPosition = notes.filter(note => note.position === undefined || note.position === null)
        
        if (notesNeedingPosition.length > 0) {
            console.log(`Assigning positions to ${notesNeedingPosition.length} notes`)
            
            const updatePromises = notesNeedingPosition.map((note, index) => {
                const position = notes.length - notesNeedingPosition.length + index
                return Note.findByIdAndUpdate(
                    note._id, 
                    { position }, 
                    { new: true }
                )
            })
            
            await Promise.all(updatePromises)
            
            notes = await Note.find({ owner: userId })
        }
        
        notes.sort((a, b) => (a.position || 0) - (b.position || 0))
        
        console.log(`Retrieved ${notes.length} notes for user ${userId}`);
        
        return res.status(200).json({
            success: true,
            message: "Notes retrieved successfully",
            data: notes
        })
    } catch (error) {
        console.error('Get notes error:', error)
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve notes",
            error: error.message
        })
    }
}

const updateNote = async (req, res) => {
    try {
        const { newTitle, newBody } = req.body
        const noteId = req.params.id
        const userId = req.user.id

        console.log('Updating note:', noteId, 'for user:', userId);

        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid note ID"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }

        const updatedNote = await Note.findOneAndUpdate(
            { _id: noteId, owner: userId },
            { 
                title: newTitle, 
                body: newBody 
            },
            { 
                new: true 
            }
        )

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            })
        }

        console.log('Updated note - position preserved:', updatedNote.position);

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            data: updatedNote
        })
    } catch (error) {
        console.error('Update note error:', error)
        return res.status(500).json({
            success: false,
            message: "Failed to update note",
            error: error.message
        })
    }
}

const deleteNote = async (req, res) => {
    try {
        const noteId = req.params.id
        const userId = req.user.id

        console.log('Deleting note:', noteId, 'for user:', userId);

        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid note ID"
            })
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }

        const deletedNote = await Note.findOneAndDelete({ 
            _id: noteId, 
            owner: userId 
        })

        if (!deletedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            })
        }

        const remainingNotes = await Note.find({ owner: userId })
            .sort({ position: 1 })
        
        const updatePromises = remainingNotes.map((note, index) => 
            Note.findByIdAndUpdate(note._id, { position: index })
        )
        
        await Promise.all(updatePromises)

        console.log('Note deleted and positions reordered');

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        })
    } catch (error) {
        console.error('Delete note error:', error)
        return res.status(500).json({
            success: false,
            message: "Failed to delete note",
            error: error.message
        })
    }
}

const updateNotePositions = async (req, res) => {
    try {
        const { notePositions } = req.body
        const userId = req.user.id

        console.log('Updating positions for user:', userId);
        console.log('Positions data:', notePositions);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            })
        }

        if (!notePositions || !Array.isArray(notePositions) || notePositions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid notePositions data - must be non-empty array"
            })
        }

        const invalidIds = notePositions.filter(np => !mongoose.Types.ObjectId.isValid(np.id))
        if (invalidIds.length > 0) {
            console.log('Invalid note IDs found:', invalidIds);
            return res.status(400).json({
                success: false,
                message: "Invalid note IDs in positions array"
            })
        }

        const noteIds = notePositions.map(np => np.id)
        const userNotes = await Note.find({ 
            _id: { $in: noteIds }, 
            owner: userId 
        })

        if (userNotes.length !== noteIds.length) {
            console.log(`Expected ${noteIds.length} notes, found ${userNotes.length}`);
            return res.status(403).json({
                success: false,
                message: "Some notes do not belong to this user"
            })
        }

        const updatePromises = notePositions.map(({ id, position }) => {
            const pos = parseInt(position)
            if (isNaN(pos)) {
                throw new Error(`Invalid position value: ${position}`)
            }
            
            return Note.findOneAndUpdate(
                { _id: id, owner: userId },
                { position: pos },
                { new: true }
            )
        })

        const results = await Promise.all(updatePromises)
        
        console.log(`Successfully updated ${results.length} note positions`);

        return res.status(200).json({
            success: true,
            message: "Note positions updated successfully",
            data: results.length
        })
    } catch (error) {
        console.error('Update positions error:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({
            success: false,
            message: "Failed to update note positions",
            error: error.message
        })
    }
}

export { createNote, getNotes, updateNote, deleteNote, updateNotePositions }