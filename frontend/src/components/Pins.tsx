import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { Plus, Trash2, Pin } from 'lucide-react';
import { type IPin } from '../models/PinItem';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ConfirmModal } from './ui/ConfirmModal';
import './Pins.css';

const PIN_COLORS = [
    '#3b82f6', // blue
    '#f59e0b', // yellow/orange
    '#ef4444', // red
    '#10b981', // green
    '#6366f1', // indigo
    '#ec4899', // pink
    '#94a3b8'  // slate
];

const Pins: React.FC = () => {
    const [pins, setPins] = useState<IPin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [selectedColor, setSelectedColor] = useState(PIN_COLORS[0]);

    const [draggedId, setDraggedId] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pinToDelete, setPinToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchPins();
    }, []);

    const fetchPins = async () => {
        try {
            const response = await api.get('/pins');
            setPins(response.data);
        } catch (error) {
            console.error('Failed to fetch pins', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() && !newContent.trim()) return;

        const newPinData = {
            title: newTitle.trim(),
            content: newContent.trim(),
            color: selectedColor
        };

        try {
            const response = await api.post('/pins', newPinData);
            setPins(prev => [response.data, ...prev]);
            setNewTitle('');
            setNewContent('');
            setSelectedColor(PIN_COLORS[0]);
            setIsFormOpen(false);
        } catch (error) {
            console.error('Failed to add pin', error);
        }
    };

    const requestDelete = (id: string) => {
        setPinToDelete(id);
        setIsModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!pinToDelete) return;
        try {
            await api.delete(`/pins/${pinToDelete}`);
            setPins(prev => prev.filter(p => p.id !== pinToDelete));
        } catch (error) {
            console.error('Failed to delete pin', error);
        } finally {
            setIsModalOpen(false);
            setPinToDelete(null);
        }
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            const el = document.getElementById(`pin-${id}`);
            if (el) el.classList.add('dragging');
        }, 0);
    };

    const handleDragEnd = (id: string) => {
        setDraggedId(null);
        const el = document.getElementById(`pin-${id}`);
        if (el) el.classList.remove('dragging');
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedId || draggedId === targetId) return;

        const newPins = [...pins];
        const draggedIndex = newPins.findIndex(p => p.id === draggedId);
        const targetIndex = newPins.findIndex(p => p.id === targetId);

        const [draggedPin] = newPins.splice(draggedIndex, 1);
        newPins.splice(targetIndex, 0, draggedPin);

        setPins(newPins);
    };

    return (
        <div className="pins-container animate-fade-in">
            <header className="pins-header">
                <div>
                    <h1><Pin className="header-icon" style={{ rotate: '45deg', display: 'inline', marginRight: '10px', color: 'var(--accent-primary)' }} /> Pin Board</h1>
                    <p>Collect your important notes and quick thoughts.</p>
                </div>
                {!isFormOpen && (
                    <Button variant="primary" onClick={() => setIsFormOpen(true)} leftIcon={<Plus size={20} />}>
                        New Pin
                    </Button>
                )}
            </header>

            {isFormOpen && (
                <Card className="pin-form-card" noPadding={false}>
                    <form className="pin-form" onSubmit={addPin}>
                        <input
                            type="text"
                            placeholder="Title (optional)"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="pin-input-title"
                            autoFocus
                        />
                        <textarea
                            placeholder="What's on your mind?"
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            className="pin-input-content"
                            rows={3}
                            required
                        />

                        <div className="pin-form-footer">
                            <div className="color-picker">
                                {PIN_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`color-dot ${selectedColor === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setSelectedColor(color)}
                                        aria-label={`Select color ${color}`}
                                    />
                                ))}
                            </div>

                            <div className="form-actions">
                                <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" leftIcon={<Plus size={20} />}>
                                    Add Pin
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>
            )}

            {isLoading ? (
                <div className="empty-state">Loading Pins...</div>
            ) : pins.length === 0 && !isFormOpen ? (
                <div className="empty-state">Your board is empty. Start pinning your thoughts!</div>
            ) : (
                <div className="masonry-grid">
                    {pins.map(pin => (
                        <Card
                            key={pin.id}
                            id={`pin-${pin.id}`}
                            className={`pin-card-oop ${draggedId === pin.id ? 'dragging' : ''}`}
                            style={{
                                borderTop: `4px solid ${pin.color}`,
                                ['--pin-color' as any]: pin.color
                            }}
                            interactive
                            draggable
                            onDragStart={(e) => handleDragStart(e, pin.id)}
                            onDragEnd={() => handleDragEnd(pin.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, pin.id)}
                        >
                            <button
                                className="pin-delete"
                                onClick={(e) => { e.stopPropagation(); requestDelete(pin.id); }}
                                aria-label="Delete pin"
                            >
                                <Trash2 size={16} />
                            </button>
                            {pin.title && <h3 className="pin-title">{pin.title}</h3>}
                            {pin.content && <p className="pin-content">{pin.content}</p>}
                            <div
                                className="pin-glow"
                                style={{ background: `radial-gradient(circle at top left, ${pin.color}22, transparent 70%)` }}
                            />
                        </Card>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={isModalOpen}
                title="Delete Pin?"
                message="This note will be permanently removed from your board. This cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default Pins;
