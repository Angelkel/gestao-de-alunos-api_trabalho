import { api } from './api.js';
import 'dotenv/config';

let tokenEmCache = null;

export async function comTokenDeAdmin() {
    if (!tokenEmCache) {
        const loginResposta = await api()
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({
                email: process.env.ADMIN_EMAIL,
                senha: process.env.ADMIN_SENHA
            });

        if (loginResposta.status !== 200 || !loginResposta.body.token) {
            throw new Error(
                `Login do admin falhou: ${loginResposta.status} - ${JSON.stringify(loginResposta.body)
                }`
            );
        }

        tokenEmCache = loginResposta.body.token;
    }

    return `Bearer ${tokenEmCache}`;
}

export async function comTokenDeAluno() {
    return getToken(
        process.env.ALUNO_EMAIL,
        process.env.ALUNO_SENHA
    );
}

export async function getToken(emailUser, passUser) {
    const loginResposta = await api()
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({
            email: emailUser,
            senha: passUser
        });

    if (loginResposta.status !== 200 || !loginResposta.body.token) {
        throw new Error(
            `Login do aluno falhou: ${loginResposta.status} - ${JSON.stringify(loginResposta.body)
            }`
        );
    }

    return loginResposta.body.token;
}