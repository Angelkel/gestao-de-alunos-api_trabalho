import request from 'supertest';
import { expect } from 'chai';
import { comTokenDeAdmin } from '../helpers/auth.js';
import Aluno from '../../src/models/aluno.model.js';
import { api } from '../helpers/api.js';
import alunos from '../fixtures/alunos.json' with { type: 'json' };

beforeEach(async () => {
    await Aluno.deleteOne({
        $or: [
            { email: 'angelica.oliveira@example.com' },
            { matricula: '2026-0001' },
        ],
    });
});

describe('Alunos External', () => {
    for (const caso of alunos) {
        it(caso.testTitle, async () => {
            const token = await comTokenDeAdmin();
            const cadastroAlunoResposta = await api()
                .post('/api/admin/alunos')
                .set('Content-Type', 'application/json')
                .set('Authorization', token)
                .send({
                    nome: caso.nome,
                    email: caso.email,
                    matricula: caso.matricula,
                    senha: caso.senha,
                });

            expect(cadastroAlunoResposta.status).to.equal(caso.statusCodeEsperado);

            if (caso.statusCodeEsperado === 201) {
                expect(cadastroAlunoResposta.body.nome).to.equal(caso.nome);
                expect(cadastroAlunoResposta.body.email).to.equal(caso.email);
                expect(cadastroAlunoResposta.body.matricula).to.equal(caso.matricula);
            }
        });
    }
});