import React, { useState, useEffect, useRef } from 'react';

interface FadeInSectionProps {
    children: React.ReactNode;
    delay?: string;
    className?: string;
}

const FadeInSection: React.FC<FadeInSectionProps> = ({ children, delay = 'delay-0', className = '' }) => {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setVisible(true);
                }
            });
        });
        if (domRef.current) observer.observe(domRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={domRef}
            className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${delay} ${className}`}
        >
            {children}
        </div>
    );
};

export default FadeInSection;
