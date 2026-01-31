import { Document, Schema } from "mongoose";
import { IFile } from "../../interfaces";
import { Utils } from "../utils";

export type FileDocument = IFile & Document;

export const FileSchema = new Schema<FileDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    content: {
      type: Buffer,
      required: true,
    },
  },
  {
    timestamps: true,
    toObject: {
      transform: Utils.toPrettyObject,
    },
    toJSON: {
      transform: Utils.toPrettyObject,
    },
  }
);
