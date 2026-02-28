import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
}

export class Button extends React.Component<ButtonProps> {
    constructor(props: ButtonProps) {
        super(props);
    }

    getStyles(): React.CSSProperties {
        const { variant = 'primary', size = 'md', fullWidth } = this.props;

        // Base styles
        const baseStyles: React.CSSProperties = {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            borderRadius: 'var(--radius-md)',
            transition: 'all var(--transition-bounce)',
            width: fullWidth ? '100%' : 'auto',
            fontFamily: 'inherit',
        };

        // Size variations
        const sizeMap: Record<string, React.CSSProperties> = {
            sm: { padding: '0.4rem 0.8rem', fontSize: '0.9rem' },
            md: { padding: '0.6rem 1.2rem', fontSize: '1rem' },
            lg: { padding: '0.8rem 1.5rem', fontSize: '1.1rem' },
        };

        // Variant variations
        const variantMap: Record<string, React.CSSProperties> = {
            primary: {
                backgroundColor: 'var(--accent-primary)',
                color: 'white',
            },
            secondary: {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-primary)',
            },
            danger: {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--danger)',
            },
            ghost: {
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
            }
        };

        return { ...baseStyles, ...sizeMap[size], ...variantMap[variant], ...(this.props.style || {}) };
    }

    render() {
        const { variant, size, fullWidth, leftIcon, children, className, disabled, ...rest } = this.props;

        // Simple hover effect simulated with a class or inline style isn't fully robust without state,
        // so we rely on global CSS where hover is more appropriate, but handle core styling inline.

        return (
            <button
                style={{
                    ...this.getStyles(),
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                }}
                disabled={disabled}
                className={`oop-btn ${className || ''}`}
                {...rest}
            >
                {leftIcon}
                {children && <span>{children}</span>}
            </button>
        );
    }
}
