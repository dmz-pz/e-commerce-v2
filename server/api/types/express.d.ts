import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      // Definimos la propiedad user globalmente para todo Express
      user?: {
        id: string;
        role: string;
        email: string;
      };
    }
  }
}
