import request from 'supertest';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import { comTokenDeAdmin, comTokenDeAluno } from '../helpers/auth.js';
import Trabalho from '../../src/models/trabalho.model.js';
import trabalhos from '../fixtures/trabalhos.json' with { type: 'json' };
import { api } from '../helpers/api.js';

describe('Trabalhos External', () => {
    for (const caso of trabalhos) {
        it(caso.testTitle, async () => {
            const tokenAluno = await comTokenDeAluno();

            expect(tokenAluno, 'Token do aluno não foi retornado')
                .to.be.a('string')
                .and.not.empty;

            const dadosToken = jwt.decode(tokenAluno);

            expect(dadosToken, 'Token do aluno é inválido')
                .to.not.equal(null);

            const alunoId = dadosToken.sub;

            const tokenAdmin = await comTokenDeAdmin();

            const disciplinaResposta = await api()
                .post('/api/admin/disciplinas')
                .set('Content-Type', 'application/json')
                .set('Authorization', tokenAdmin)
                .send({
                    nome: 'Disciplina do teste',
                    codigo: `TEST-${Date.now()}`
                });

            expect(disciplinaResposta.status).to.equal(201);

            const disciplinaId = disciplinaResposta.body.id;

            const primeiraMatriculaResposta = await api()
                .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
                .set('Content-Type', 'application/json')
                .set('Authorization', tokenAdmin)
                .send({ alunoId });

            expect(primeiraMatriculaResposta.status).to.equal(201);

            const matriculaResposta = await api()
                .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
                .set('Content-Type', 'application/json')
                .set('Authorization', tokenAdmin)
                .send({ alunoId });

            expect(matriculaResposta.status).to.equal(409);

            await Trabalho.deleteMany({
                alunoId,
                disciplinaId,
                titulo: caso.titulo,
            });

            const resposta = await api()
                .post(`/api/alunos/${alunoId}/trabalhos`)
                .set('Content-Type', 'application/json')
                .set('Authorization', `Bearer ${tokenAluno}`)
                .send({
                    disciplinaId,
                    titulo: caso.titulo,
                    descricao: caso.descricao,
                });

            expect(resposta.status).to.equal(caso.statusCodeEsperado);
            expect(resposta.body.alunoId).to.equal(alunoId);
            expect(resposta.body.disciplinaId).to.equal(disciplinaId);
            expect(resposta.body.titulo).to.equal(caso.titulo);
            expect(resposta.body.descricao).to.equal(caso.descricao);
            expect(resposta.body.status).to.equal('entregue');
        });
    }
});