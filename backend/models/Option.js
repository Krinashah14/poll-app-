import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Option = sequelize.define("Option", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  text: { type: DataTypes.STRING(80), allowNull: false }
}, { tableName: "options", timestamps: false });
