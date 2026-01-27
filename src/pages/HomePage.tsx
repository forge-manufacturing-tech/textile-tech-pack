import React from 'react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-industrial-steel-950 text-neutral-100 metal-texture overflow-x-hidden">
            {/* Header/Nav */}
            <header className="border-b border-industrial-concrete bg-industrial-steel-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <h1 className="industrial-headline text-2xl">INTERLOCK</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 text-xs font-mono uppercase tracking-widest text-industrial-steel-400 hover:text-industrial-copper-500 transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/login?mode=register')}
                            className="px-4 py-2 industrial-btn rounded-sm text-xs"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-24 px-6 scanlines border-b border-industrial-concrete">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-block px-3 py-1 mb-6 border border-industrial-copper-500/30 bg-industrial-copper-500/10 rounded-full">
                        <span className="text-[10px] font-mono text-industrial-copper-500 uppercase tracking-widest">Bridging the Gap</span>
                    </div>
                    <h2 className="industrial-headline text-5xl md:text-7xl mb-8 leading-tight">
                        ACCELERATE <br/> <span className="text-industrial-copper-500">TECHNOLOGY TRANSFER</span>
                    </h2>
                    <p className="text-industrial-steel-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light mb-12">
                        Interlock solves the gap between designers and manufacturers by streamlining the complex back-and-forth process of moving form to factory.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/login?mode=register')}
                            className="px-8 py-4 industrial-btn text-sm tracking-widest"
                        >
                            INITIALIZE TRANSFER
                        </button>
                        <button
                            onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 border border-industrial-concrete bg-industrial-steel-900 hover:bg-industrial-steel-800 text-industrial-steel-300 rounded-sm text-sm font-mono uppercase tracking-widest transition-colors"
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section id="problem" className="py-24 px-6 bg-industrial-steel-900/30 border-b border-industrial-concrete">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h3 className="industrial-headline text-3xl mb-6">THE MANUFACTURER'S DILEMMA</h3>
                        <p className="text-industrial-steel-400 mb-6 leading-relaxed">
                            The interaction between contract manufacturers and purchasers is broken. It involves a complex, long back-and-forth process of email chains, missing files, and misinterpreted requirements.
                        </p>
                        <p className="text-industrial-steel-400 mb-6 leading-relaxed">
                            Engineers spend more time deciphering vague requests than actually manufacturing parts, leading to delays, quality issues, and increased costs.
                        </p>
                        <div className="p-6 border-l-2 border-industrial-copper-500 bg-industrial-steel-950/50">
                            <p className="text-industrial-copper-400 font-mono text-sm italic">
                                "The gap between design intent and manufacturing reality is where value is lost."
                            </p>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-industrial-copper-500/5 blur-3xl rounded-full"></div>
                        <div className="relative industrial-panel p-8 transform rotate-1">
                            <div className="space-y-4 font-mono text-xs text-industrial-steel-500">
                                <div className="p-3 border border-industrial-concrete bg-industrial-steel-950 rounded-sm">
                                    <span className="text-industrial-alert">ERROR:</span> Missing tolerance specs in Drawing_v2.pdf
                                </div>
                                <div className="p-3 border border-industrial-concrete bg-industrial-steel-950 rounded-sm">
                                    <span className="text-industrial-caution">WAITING:</span> Clarification on material finish (Thread #442)
                                </div>
                                <div className="p-3 border border-industrial-concrete bg-industrial-steel-950 rounded-sm">
                                    <span className="text-industrial-alert">ERROR:</span> CAD file version mismatch
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trends Section */}
            <section className="py-24 px-6 border-b border-industrial-concrete">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="industrial-headline text-3xl mb-4">INDUSTRY HEADWINDS</h3>
                        <p className="text-industrial-steel-400 font-mono text-sm uppercase tracking-widest">Why automation is no longer optional</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="industrial-panel p-8 hover:border-industrial-copper-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-industrial-steel-900 border border-industrial-concrete rounded-sm flex items-center justify-center mb-6 group-hover:border-industrial-copper-500 transition-colors">
                                <svg className="w-6 h-6 text-industrial-steel-500 group-hover:text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-neutral-200 mb-3">Labor Shortages</h4>
                            <p className="text-industrial-steel-400 text-sm leading-relaxed">
                                Skilled manufacturing talent is retiring faster than it can be replaced, creating a knowledge vacuum on the factory floor.
                            </p>
                        </div>

                        <div className="industrial-panel p-8 hover:border-industrial-copper-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-industrial-steel-900 border border-industrial-concrete rounded-sm flex items-center justify-center mb-6 group-hover:border-industrial-copper-500 transition-colors">
                                <svg className="w-6 h-6 text-industrial-steel-500 group-hover:text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-neutral-200 mb-3">Supply Chain Flux</h4>
                            <p className="text-industrial-steel-400 text-sm leading-relaxed">
                                Global volatility requires rapid adaptability. Static supplier relationships are being replaced by dynamic, digital-first networks.
                            </p>
                        </div>

                        <div className="industrial-panel p-8 hover:border-industrial-copper-500/50 transition-colors group">
                            <div className="w-12 h-12 bg-industrial-steel-900 border border-industrial-concrete rounded-sm flex items-center justify-center mb-6 group-hover:border-industrial-copper-500 transition-colors">
                                <svg className="w-6 h-6 text-industrial-steel-500 group-hover:text-industrial-copper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-bold text-neutral-200 mb-3">Time-to-Market Pressure</h4>
                            <p className="text-industrial-steel-400 text-sm leading-relaxed">
                                The speed of innovation is increasing. Traditional "throw it over the wall" engineering practices are too slow for modern product cycles.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-24 px-6 bg-industrial-steel-900/30 border-b border-industrial-concrete">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h3 className="industrial-headline text-3xl mb-4">FOUNDING TEAM</h3>
                        <p className="text-industrial-steel-400 font-mono text-sm uppercase tracking-widest">Architects of the new industrial standard</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-12">
                        {[
                            { name: 'Tyler Mangini', role: 'Co-Founder' },
                            { name: 'Arshaan Ali', role: 'Co-Founder' },
                            { name: 'Nathan Alam', role: 'Co-Founder' }
                        ].map((member) => (
                            <div key={member.name} className="text-center group">
                                <div className="w-32 h-32 mx-auto bg-industrial-steel-800 rounded-full border-2 border-industrial-concrete group-hover:border-industrial-copper-500 transition-colors mb-4 flex items-center justify-center">
                                    <span className="text-2xl font-mono text-industrial-steel-600 group-hover:text-industrial-copper-500 transition-colors">
                                        {member.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                </div>
                                <h4 className="text-lg font-bold text-neutral-200">{member.name}</h4>
                                <p className="text-industrial-steel-500 text-sm font-mono uppercase tracking-wide">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-4xl mx-auto text-center industrial-panel p-12 bg-gradient-to-b from-industrial-steel-900 to-industrial-steel-950">
                    <h3 className="industrial-headline text-3xl mb-6">READY TO SYNC?</h3>
                    <p className="text-industrial-steel-400 mb-8 max-w-2xl mx-auto">
                        Stop interpreting. Start manufacturing. Join the platform that speaks the language of both design and production.
                    </p>
                    <button
                        onClick={() => navigate('/login?mode=register')}
                        className="px-12 py-4 industrial-btn text-sm tracking-widest"
                    >
                        CREATE ACCOUNT
                    </button>
                    <div className="mt-6">
                         <button
                            onClick={() => navigate('/login')}
                            className="text-industrial-steel-500 hover:text-industrial-copper-500 text-xs font-mono uppercase tracking-widest transition-colors"
                        >
                            Already have an account? Log In
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-industrial-concrete bg-industrial-steel-950 text-center">
                <p className="text-industrial-steel-600 text-[10px] font-mono uppercase tracking-widest">
                    © {new Date().getFullYear()} Interlock Systems. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
