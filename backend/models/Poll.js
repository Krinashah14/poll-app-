import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Poll = sequelize.define("Poll", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  question: { type: DataTypes.STRING(120), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false }
}, { tableName: "polls", timestamps: true });
