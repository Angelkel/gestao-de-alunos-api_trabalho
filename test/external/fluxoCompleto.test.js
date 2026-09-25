import { api } from '../helpers/api.js';
import { expect } from 'chai';
import { comTokenDeAdmin, getToken } from '../helpers/auth.js';

import Aluno from '../../src/models/aluno.model.js';
import Disciplina from '../../src/models/disciplina.model.js';
import Matricula from '../../src/models/matricula.model.js';
import Trabalho from '../../src/models/trabalho.model.js';

import fluxoCases from '../fixtures/fluxoCompleto.json' with { type: 'json' };

describe('Fluxo completo de aluno', () => {
    for (const caso of fluxoCases) {
        describe(`Cenário: ${caso.email}`, () => {
            beforeEach(async () => {
                const aluno = await Aluno.findOne({ email: caso.email });

                if (aluno) {
                    await Trabalho.deleteMany({ alunoId: aluno._id });
                    await Matricula.deleteMany({ alunoId: aluno._id });
                    await Aluno.deleteOne({ _id: aluno._id });
                }

                await Disciplina.deleteMany({
                    $or: [
                        { nome: caso.disciplinaNome },
                        { codigo: caso.disciplinaCodigo }
                    ]
                });
            });

            it(`DDT: realizar o cadastro, o login, a matrícula e entrega - ${caso.email}`, async () => {
                const tokenAdmin = await comTokenDeAdmin();

                const cadastroAlunoResposta = await api()
                    .post('/api/admin/alunos')
                    .set('Authorization', tokenAdmin)
                    .send({
                        nome: caso.nome,
                        email: caso.email,
                        matricula: caso.matricula,
                        senha: caso.senha
                    });

                expect(cadastroAlunoResposta.status)
                    .to.equal(caso.cadastroStatusEsperado);

                const alunoId = cadastroAlunoResposta.body.id;

                const loginResposta = await api()
                    .post('/api/auth/login')
                    .send({
                        email: caso.email,
                        senha: caso.senha
                    });

                expect(loginResposta.status)
                    .to.equal(caso.loginStatusEsperado);

                const tokenAluno = await getToken(caso.email, caso.senha);

                const disciplinaResposta = await api()
                    .post('/api/admin/disciplinas')
                    .set('Authorization', tokenAdmin)
                    .send({
                        nome: caso.disciplinaNome,
                        descricao: caso.disciplinaDescricao,
                        codigo: caso.disciplinaCodigo
                    });

                expect(disciplinaResposta.status).to.equal(201);

                //console.log('Disciplina criada:', disciplinaResposta.body);

                const disciplinaId =
                    disciplinaResposta.body.id ??
                    disciplinaResposta.body._id;

                expect(disciplinaId).to.exist;

                const matriculaResposta = await api()
                    .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
                    .set('Authorization', tokenAdmin)
                    .send({ alunoId });

                //console.log('IDs da matrícula:', {
                //    alunoIdResposta: matriculaResposta.body.alunoId,
                //    disciplinaIdResposta: matriculaResposta.body.disciplinaId,
                //    disciplinaIdEsperado: disciplinaId
                //});;

                expect(matriculaResposta.status)
                    .to.equal(caso.matriculaStatusEsperado);

                expect(matriculaResposta.body.alunoId)
                    .to.equal(alunoId);

                expect(matriculaResposta.body.disciplinaId)
                    .to.equal(disciplinaId);

                const entregaResposta = await api()
                    .post(`/api/alunos/${alunoId}/trabalhos`)
                    .set('Authorization', `Bearer ${tokenAluno}`)
                    .send({
                        disciplinaId,
                        titulo: caso.titulo,
                        descricao: caso.descricao
                    });

                //console.log('Resposta da entrega:', {
                //    status: entregaResposta.status,
                //    body: entregaResposta.body
                //})

                expect(entregaResposta.status)
                    .to.equal(caso.entregaStatusEsperado);

                expect(entregaResposta.body.alunoId).to.equal(alunoId);
                expect(entregaResposta.body.disciplinaId).to.equal(disciplinaId);
                expect(entregaResposta.body.titulo).to.equal(caso.titulo);
                expect(entregaResposta.body.descricao).to.equal(caso.descricao);
                expect(entregaResposta.body.status).to.equal('entregue');
            });
        });
    }
});