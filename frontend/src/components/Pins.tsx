import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { Plus, Trash2 } from 'lucide-react';
import { type IPin } from '../models/PinItem';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import './Pins.css';

const PIN_COLORS = [
    '#3b82f6', // blue
    '#f59e0b', // yellow/orange
    '#ef4444', // red
    '#10b981', // green
    '#8b5cf6', // purple
    '#ec4899'  // pink
];

const Pins: React.FC = () => {
    const [pins, setPins] = useState<IPin[]>([]); // Changed type to IPin[]
    const [isLoading, setIsLoading] = useState(true); // Added loading state
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [selectedColor, setSelectedColor] = useState(PIN_COLORS[0]);

    const [draggedId, setDraggedId] = useState<string | null>(null);

    // Fetch pins on mount
    useEffect(() => {
        fetchPins();
    }, []);

    const fetchPins = async () => {
        try {
            const response = await api.get('/pins');
            // Assuming API returns an array mapping correctly to IPin interface
            setPins(response.data);
        } catch (error) {
            console.error('Failed to fetch pins', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addPin = async (e: React.FormEvent) => { // Made async
        e.preventDefault();
        if (!newTitle.trim() && !newContent.trim()) return;

        const newPinData = { // Changed to plain object for API
            title: newTitle.trim(),
            content: newContent.trim(),
            color: selectedColor
        };

        try {
            const response = await api.post('/pins', newPinData);
            setPins(prev => [response.data, ...prev]); // Add new pin from API response
            setNewTitle('');
            setNewContent('');
            setSelectedColor(PIN_COLORS[0]);
            setIsFormOpen(false); // Close form after adding
        } catch (error) {
            console.error('Failed to add pin', error);
        }
    };

    const deletePin = async (id: string) => { // Made async
        try {
            await api.delete(`/pins/${id}`);
            setPins(prev => prev.filter(p => p.id !== id)); // Filter out deleted pin
        } catch (error) {
            console.error('Failed to delete pin', error);
        }
    };

    // This function now needs to update the order on the backend as well
    // For simplicity, this example only updates local state. A real app would make an API call.
    const updatePinOrder = (newPins: IPin[]) => {
        setPins(newPins);
        // In a real application, you would make an API call here to save the new order
        // e.g., api.put('/pins/order', newPins.map(p => p.id));
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
        // Small timeout for visual feedback
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
        e.preventDefault(); // Necessary to allow dropping
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

        updatePinOrder(newPins); // Use the new update function
    };

    return (
        <div className="pins-container animate-fade-in">
            <header className="pins-header">
                <div>
                    <h1>Pin Board</h1>
                    <p>Important notes and quick thoughts.</p>
                </div>
                {!isFormOpen && (
                    <Button variant="primary" onClick={() => setIsFormOpen(true)} leftIcon={<Plus size={20} />}>
                        New Pin
                    </Button>
                )}
            </header>

            {isFormOpen && (
                <Card className="pin-form-card">
                    <form className="pin-form" onSubmit={addPin}>
                        <input
                            type="text"
                            placeholder="Title (optional)"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="pin-input-title"
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
                <div className="empty-state">No pins yet. Create one to get started!</div>
            ) : (
                <div className="masonry-grid">
                    {pins.map(pin => (
                        <Card
                            key={pin.id}
                            id={`pin-${pin.id}`}
                            className={`pin-card-oop ${draggedId === pin.id ? 'dragging' : ''}`}
                            style={{
                                borderTopColor: pin.color,
                                borderTopWidth: '4px',
                                backgroundColor: `${pin.color}15`,
                                cursor: 'grab'
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
                                onClick={() => deletePin(pin.id)}
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
        </div>
    );
};

export default Pins;
