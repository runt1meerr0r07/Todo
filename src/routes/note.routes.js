import { Router } from "express";
import { verifyAuth } from "../middleware/auth.middleware.js";
import { createNote, getNotes, updateNote, deleteNote, updateNotePositions } from "../controllers/note.controller.js";

const noteRoutes = Router()


noteRoutes.route("/create-note").post(verifyAuth, createNote)
noteRoutes.route("/get-notes").get(verifyAuth, getNotes)  
noteRoutes.route("/update-positions").put(verifyAuth, updateNotePositions)  

noteRoutes.route("/:id").put(verifyAuth, updateNote)
noteRoutes.route("/:id").delete(verifyAuth, deleteNote)

export default noteRoutes