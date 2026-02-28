import React, { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
    interactive?: boolean;
}

export class Card extends React.Component<CardProps> {
    getStyles(): React.CSSProperties {
        const { noPadding, interactive } = this.props;

        return {
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
            borderRadius: 'var(--radius-lg)',
            padding: noPadding ? '0' : '1.5rem',
            transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
            cursor: interactive ? 'pointer' : 'default',
            ...(this.props.style || {})
        };
    }

    render() {
        const { noPadding, interactive, children, className, ...rest } = this.props;

        return (
            <div
                style={this.getStyles()}
                className={`oop-card ${interactive ? 'interactive' : ''} ${className || ''}`}
                {...rest}
            >
                {children}
            </div>
        );
    }
}
