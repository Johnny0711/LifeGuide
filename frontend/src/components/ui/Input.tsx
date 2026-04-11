import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    fullWidth?: boolean;
    hasError?: boolean;
}

export class Input extends React.Component<InputProps> {
    getStyles(): React.CSSProperties {
        const { fullWidth, hasError } = this.props;

        return {
            padding: '0.8rem 1.2rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: `1px solid ${hasError ? 'var(--danger)' : 'var(--glass-border)'}`,
            color: 'var(--text-primary)',
            fontSize: '1rem',
            fontFamily: 'inherit',
            transition: 'all var(--transition-fast)',
            width: fullWidth ? '100%' : 'auto',
            outline: 'none',
        };
    }

    render() {
        const { fullWidth, hasError, className, ...rest } = this.props;

        return (
            <input
                style={this.getStyles()}
                className={`oop-input ${className || ''}`}
                {...rest}
            />
        );
    }
}
