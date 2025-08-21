import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Vote = sequelize.define("Vote", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  // hashed device fingerprint for soft one-vote (UA+IP)
  fpHash: { type: DataTypes.STRING(128), allowNull: false }
}, { tableName: "votes", timestamps: true, updatedAt: false });
