import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}

const Card: React.FC<CardProps & { premium?: boolean }> = ({
    children,
    className = '',
    onClick,
    hover = true,
    premium = false
}) => {
    return (
        <div
            className={`${premium ? 'card-premium' : 'card'} ${hover ? 'hover:scale-105 cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;
