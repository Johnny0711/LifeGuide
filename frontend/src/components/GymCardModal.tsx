import React, { useState } from 'react';
import './GymCardModal.css';
import { X, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/apiService';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface GymCardData {
    gymName: string;
    barcodeValue: string;
    colorTheme: string;
}

interface GymCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    cardData: GymCardData | null;
    onSaveSuccess: (updatedCard: GymCardData) => void;
}

const GymCardModal: React.FC<GymCardModalProps> = ({ isOpen, onClose, cardData, onSaveSuccess }) => {
    const [isEditing, setIsEditing] = useState(!cardData);
    const [formData, setFormData] = useState<GymCardData>({
        gymName: cardData?.gymName || 'My Gym',
        barcodeValue: cardData?.barcodeValue || '123456789',
        colorTheme: cardData?.colorTheme || '#000000'
    });
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await api.post('/gym-cards', formData);
            onSaveSuccess(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save gym card', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="gym-modal-overlay animate-fade-in" onClick={onClose}>
            <div className="gym-modal-content slide-up" onClick={(e) => e.stopPropagation()}>
                
                {/* The Pass Preview */}
                <div 
                    className="wallet-pass" 
                    style={{ backgroundColor: formData.colorTheme }}
                >
                    <div className="pass-header">
                        <div className="pass-logo-group">
                            <div className="pass-logo-icon">🏋️</div>
                            <h2 className="pass-title">{formData.gymName || 'Gym Name'}</h2>
                        </div>
                        <button className="close-pass-btn" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="pass-body">
                        <div className="pass-field">
                            <span className="field-label">MEMBERSHIP</span>
                            <span className="field-value">V.I.P.</span>
                        </div>
                    </div>

                    <div className="pass-barcode-section">
                        <div className="barcode-bg">
                            <QRCodeSVG 
                                value={formData.barcodeValue || '123456789'} 
                                size={140} 
                                fgColor="#000000"
                                bgColor="#ffffff"
                                level="M"
                                includeMargin={false}
                            />
                        </div>
                        <span className="barcode-text">{formData.barcodeValue}</span>
                    </div>
                </div>

                {/* Edit Controls */}
                <div className="pass-controls">
                    {isEditing ? (
                        <div className="edit-form slide-down">
                            <h3>Edit Card Details</h3>
                            <Input 
                                placeholder="Gym Name (e.g. FitX)" 
                                value={formData.gymName}
                                onChange={e => setFormData({...formData, gymName: e.target.value})}
                            />
                            <Input 
                                placeholder="Member ID / Barcode" 
                                value={formData.barcodeValue}
                                onChange={e => setFormData({...formData, barcodeValue: e.target.value})}
                            />
                            <div className="color-picker-group">
                                <label>Card Color:</label>
                                <input 
                                    type="color" 
                                    value={formData.colorTheme} 
                                    onChange={e => setFormData({...formData, colorTheme: e.target.value})}
                                    className="color-input"
                                />
                            </div>
                            
                            <Button 
                                variant="primary" 
                                fullWidth 
                                onClick={handleSave}
                                disabled={isSaving || !formData.gymName || !formData.barcodeValue}
                            >
                                {isSaving ? 'Saving...' : 'Save Card'}
                            </Button>
                        </div>
                    ) : (
                        <Button variant="secondary" fullWidth onClick={() => setIsEditing(true)}>
                            Edit Details
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GymCardModal;
