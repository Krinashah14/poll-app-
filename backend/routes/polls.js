   // backend/routes/polls.js
   const express = require("express");
   const { createNewPoll } = require("../controllers/polls");

   const router = express.Router();
   router.post("/", createNewPoll);

   module.exports = router;
   