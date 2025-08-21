   // backend/controllers/polls.js
   const { createPoll } = require("../models/Poll");

   const createNewPoll = async (req, res) => {
     try {
       const { question, options } = req.body;
       const newPoll = await createPoll(question, options);
       res.status(201).json(newPoll.rows[0]);
     } catch (error) {
       res.status(500).send("Server Error");
     }
   };

   module.exports = { createNewPoll };
   