import React, { useState, useEffect } from 'react';
import { generateTestimonials } from '../services/geminiService';
import { Testimonial } from '../types';

const QuoteIcon = () => (
    <svg className="w-10 h-10 text-[#E5B8B8] opacity-50" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14">
        <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/>
    </svg>
);

const TestimonialCard: React.FC<Testimonial> = ({ quote, author, favoriteCake }) => (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-pink-100 h-full flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
        <QuoteIcon />
        <p className="text-gray-600 italic my-4 flex-grow">"{quote}"</p>
        <div className="mt-4">
            <p className="font-bold text-[#8D6E63]">{author}</p>
            <p className="text-sm text-gray-500">Bolo Favorito: <span className="text-[#D99A9A] font-semibold">{favoriteCake}</span></p>
        </div>
    </div>
);

const LoadingSkeleton: React.FC = () => (
    <div className="grid md:grid-cols-3 gap-8 animate-pulse">
        {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-white rounded-2xl p-8 shadow-lg h-64">
                <div className="h-8 w-10 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-5 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/5 mt-2"></div>
            </div>
        ))}
    </div>
);

const TestimonialsSection: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const resultString = await generateTestimonials();
                const data = JSON.parse(resultString);
                setTestimonials(data);
            } catch (err) {
                console.error(err);
                setError("Não conseguimos carregar nosso cantinho de carinho. Tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, []);

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Nosso Cantinho do Carinho</h2>
                <p className="text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">O que a família BoloFlix anda dizendo por aí...</p>

                {loading && <LoadingSkeleton />}
                {error && <p className="text-center text-red-500">{error}</p>}
                
                {!loading && !error && (
                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <TestimonialCard key={index} {...testimonial} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TestimonialsSection;