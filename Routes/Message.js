import express from 'express';
import { fetchExistingMessage, fetchPreviousChats, sendMessage } from '../controller/Message.js';
import protect from '../Middleware/protect.js';

const router = express.Router()

router.post("/message", protect, sendMessage)
router.get("/fetchchats/:id", protect, fetchPreviousChats)
router.get("/fetchexistingmsg",  fetchExistingMessage)


export default router