import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      // Definimos la propiedad user globalmente para todo Express
      user?: {
        id: string;
        name: string;
        role: string;
        email: string;
      };
    }
  }
}
