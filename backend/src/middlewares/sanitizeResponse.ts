// src/middlewares/sanitizeResponse.ts
import { Request, Response, NextFunction } from "express";

function removePassword(obj: any): any {
  if (!obj) return obj;

  if (Array.isArray(obj)) {
    return obj.map(removePassword);
  }

  if (typeof obj === "object") {
    const newObj: any = {};
    for (const key of Object.keys(obj)) {
      if (key === "password_hash") continue; // 🔒 jangan ikut return
      newObj[key] = removePassword(obj[key]);
    }
    return newObj;
  }

  return obj;
}

export function sanitizeResponse(req: Request, res: Response, next: NextFunction) {
  const oldJson = res.json.bind(res);

  res.json = (data: any) => {
    const sanitized = removePassword(data);
    return oldJson(sanitized);
  };

  next();
}
