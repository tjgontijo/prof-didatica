'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaGraduationCap, FaUsers, FaHeart } from 'react-icons/fa';

export default function Author() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-dl-primary-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header com gradiente */}
          <div className="bg-gradient-to-r from-dl-primary-800 to-dl-primary-500 p-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase">
              Quem criou o Desafio Literário?
            </h2>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-[300px_1fr] gap-8 items-start">
              {/* Foto da autora */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="mx-auto md:mx-0"
              >
                <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-dl-primary-100 shadow-lg">
                  <Image
                    src="/images/authors/profile-placeholder.jpg"
                    alt="Foto da criadora do Desafio Literário"
                    fill
                    sizes="(max-width: 768px) 256px, 288px"
                    style={{ objectFit: 'cover' }}
                    className="grayscale-0"
                  />
                </div>
              </motion.div>

              {/* Conteúdo */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-dl-primary-800 mb-2">
                    Professora [Nome]
                  </h3>
                  <p className="text-lg text-dl-primary-500 font-medium">
                    Especialista em Alfabetização e Letramento
                  </p>
                </div>

                <p className="text-gray-700 leading-relaxed text-lg">
                  Sou professora há mais de [X] anos e sei como é desafiador fazer os alunos se
                  interessarem pela leitura em meio a tantas distrações. Por isso, criei o
                  <span className="font-bold text-dl-primary-800"> Desafio Literário</span> —
                  um método prático e gamificado que já ajudou milhares de professoras a
                  transformarem suas aulas de leitura.
                </p>

                {/* Credenciais */}
                <div className="space-y-4 bg-dl-primary-50 p-6 rounded-lg">
                  <h4 className="font-bold text-dl-primary-800 text-lg mb-4 flex items-center">
                    <FaGraduationCap className="mr-2 text-dl-accent" />
                    Formação e Experiência:
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <FaCheckCircle className="text-dl-accent mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Graduação em Pedagogia</strong> com especialização em Alfabetização
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-dl-accent mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Mais de [X] anos</strong> de experiência em sala de aula
                      </span>
                    </li>
                    <li className="flex items-start">
                      <FaCheckCircle className="text-dl-accent mt-1 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">
                        <strong>Criadora de materiais pedagógicos</strong> utilizados por milhares de professores
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-dl-primary-100">
                    <FaUsers className="text-3xl text-dl-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-dl-primary-800">10.000+</p>
                    <p className="text-sm text-gray-600">Professoras impactadas</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-dl-primary-100">
                    <FaHeart className="text-3xl text-dl-warning mx-auto mb-2" />
                    <p className="text-2xl font-bold text-dl-primary-800">4.8/5</p>
                    <p className="text-sm text-gray-600">Avaliação média</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-dl-primary-100 col-span-2 md:col-span-1">
                    <FaGraduationCap className="text-3xl text-dl-accent mx-auto mb-2" />
                    <p className="text-2xl font-bold text-dl-primary-800">[X]+</p>
                    <p className="text-sm text-gray-600">Anos de experiência</p>
                  </div>
                </div>

                {/* Mensagem pessoal */}
                <div className="mt-6 p-6 bg-gradient-to-r from-dl-primary-50 to-blue-50 rounded-lg border-l-4 border-dl-accent">
                  <p className="text-gray-700 italic leading-relaxed">
                    "Minha missão é facilitar o trabalho das professoras e despertar o amor pela
                    leitura nos alunos. O Desafio Literário nasceu da minha própria experiência em
                    sala de aula e foi testado e aprovado por milhares de educadoras."
                  </p>
                  <p className="text-right mt-3 font-bold text-dl-primary-800">
                    — Professora [Nome]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
