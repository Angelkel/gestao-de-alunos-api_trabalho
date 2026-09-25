import request from 'supertest';
import { expect } from 'chai';
//import mongoose from 'mongoose';
import app from '../src/app.js';

describe('Login', () => {
    it('deve retornar 200 quando o usuário e senha forem corretos', async () => {
        const loginResposta = await request(app)
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                email: 'admin@escola.com', 
                senha: 'admin123'
            });     
            
        expect(loginResposta.status).to.equal(200);        
    });
}); 