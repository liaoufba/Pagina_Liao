import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram, FaLinkedin, FaEnvelope, FaLock } from 'react-icons/fa';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-neutral-100 text-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 border-t border-neutral-200 dark:border-neutral-900 mt-auto transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">LIAO UFBA</h3>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">
                            Liga Acadêmica de Inteligência Artificial e Otimização da <a href="https://www.ufba.br/" target="_blank" rel="noopener noreferrer" className="font-medium text-neutral-800 dark:text-neutral-200 hover:text-primary-800 dark:hover:text-white underline transition-colors">UFBA</a> - Desenvolvendo soluções inovadoras e capacitando estudantes.
                        </p>
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                            Filiada ao <a href="https://computacao.ufba.br/" target="_blank" rel="noopener noreferrer" className="text-neutral-700 dark:text-neutral-300 hover:text-primary-800 dark:hover:text-white underline transition-colors">Instituto de Computação da UFBA</a>.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">Links Rápidos</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/members" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-white transition-colors">
                                    Membros & Tutores
                                </Link>
                            </li>
                            <li>
                                <Link to="/about#numeros" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-white transition-colors">
                                    LIAO em Números
                                </Link>
                            </li>
                            <li>
                                <Link to="/prosel" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-white transition-colors">
                                    Processo Seletivo
                                </Link>
                            </li>
                            <li>
                                <Link to="/newsletter" className="text-neutral-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-white transition-colors">
                                    Newsletter
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">Contato</h3>
                        <ul className="space-y-4 text-neutral-650 dark:text-neutral-400">
                            <li>
                                <a href="mailto:liaoufba@gmail.com" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-white transition-colors">
                                    <FaEnvelope className="text-xl" />
                                    <span>liaoufba@gmail.com</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://www.instagram.com/liaoufba" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-white transition-colors">
                                    <FaInstagram className="text-xl" />
                                    <span>@liaoufba</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/company/liao-ufba" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-primary-800 dark:hover:text-white transition-colors">
                                    <FaLinkedin className="text-xl" />
                                    <span>LIAO - UFBA</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-2">
                    <p>&copy; {currentYear} LIAO. Todos os direitos reservados.</p>
                    <Link 
                        to="/login" 
                        className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors opacity-60 hover:opacity-100 flex items-center gap-1.5"
                    >
                        <FaLock className="text-[10px]" />
                        <span>Acesso Restrito</span>
                    </Link>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
