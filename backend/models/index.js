import { sequelize } from "../config/db.js";
import { Poll } from "./Poll.js";
import { Option } from "./Option.js";
import { Vote } from "./Vote.js";

Poll.hasMany(Option, { foreignKey: "pollId", onDelete: "CASCADE" });
Option.belongsTo(Poll, { foreignKey: "pollId" });

Poll.hasMany(Vote, { foreignKey: "pollId", onDelete: "CASCADE" });
Vote.belongsTo(Poll, { foreignKey: "pollId" });

Option.hasMany(Vote, { foreignKey: "optionId", onDelete: "CASCADE" });
Vote.belongsTo(Option, { foreignKey: "optionId" });

export { sequelize, Poll, Option, Vote };
