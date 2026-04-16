import React, { useState } from 'react';
import './GymCardModal.css';
import { X, MoreHorizontal, RotateCcw } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
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
    
    // Check for format prefix (QR| or 1D|)
    const parseBarcode = (val: string) => {
        if (!val) return { format: '1D', value: '' };
        if (val.startsWith('QR|')) return { format: 'QR', value: val.substring(3) };
        if (val.startsWith('1D|')) return { format: '1D', value: val.substring(3) };
        return { format: '1D', value: val }; // Default for old data
    };

    const initialParsed = parseBarcode(cardData?.barcodeValue || '');

    const [isFlipped, setIsFlipped] = useState(!cardData);
    const [formData, setFormData] = useState({
        gymName: cardData?.gymName || 'My Gym',
        barcodeValue: initialParsed.value || '',
        format: initialParsed.format,
        colorTheme: cardData?.colorTheme || '#1a1a1a'
    });
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const packedBarcode = `${formData.format}|${formData.barcodeValue}`;
            const payload: GymCardData = {
                gymName: formData.gymName,
                barcodeValue: packedBarcode,
                colorTheme: formData.colorTheme
            };
            const response = await api.post('/gym-cards', payload);
            onSaveSuccess(response.data);
            setIsFlipped(false);
        } catch (error) {
            console.error('Failed to save gym card', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="gym-modal-overlay animate-fade-in" onClick={onClose}>
            <div className="gym-modal-container slide-up" onClick={(e) => e.stopPropagation()}>
                
                {/* Close Button top-right outside card */}
                <button className="super-close-btn" onClick={onClose}>
                    <span>Done</span>
                </button>

                <div className={`wallet-flip-container ${isFlipped ? 'flipped' : ''}`}>
                    <div className="wallet-pass-flipper">
                        
                        {/* FRONT OF PASS */}
                        <div className="wallet-pass-front" style={{ backgroundColor: formData.colorTheme }}>
                            <div className="pass-header">
                                <div className="pass-logo-group">
                                    <div className="pass-logo-icon">🏋️</div>
                                    <h2 className="pass-title">{formData.gymName || 'Gym Name'}</h2>
                                </div>
                                <button className="info-pass-btn" onClick={() => setIsFlipped(true)}>
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            <div className="pass-body">
                                <div className="pass-field">
                                    <span className="field-label">MEMBERSHIP</span>
                                    <span className="field-value">MEMBER</span>
                                </div>
                            </div>

                            <div className="pass-barcode-section">
                                <div className="barcode-bg">
                                    {formData.format === 'QR' ? (
                                        <QRCodeSVG 
                                            value={formData.barcodeValue || '123456789'} 
                                            size={140} 
                                            fgColor="#000000"
                                            bgColor="#ffffff"
                                            level="M"
                                            includeMargin={false}
                                        />
                                    ) : (
                                        <Barcode 
                                            value={formData.barcodeValue || '123456789'}
                                            width={2}
                                            height={60}
                                            displayValue={false}
                                            margin={0}
                                            background="#ffffff"
                                        />
                                    )}
                                </div>
                                <span className="barcode-text">{formData.barcodeValue}</span>
                            </div>
                        </div>

                        {/* BACK OF PASS (EDIT) */}
                        <div className="wallet-pass-back">
                            <div className="back-header">
                                <h3>Pass Settings</h3>
                                <button className="info-pass-btn" onClick={() => cardData ? setIsFlipped(false) : onClose()}>
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="edit-form">
                                <div className="form-group">
                                    <label>Gym Name</label>
                                    <Input 
                                        placeholder="FitX, McFit, etc." 
                                        value={formData.gymName}
                                        onChange={e => setFormData({...formData, gymName: e.target.value})}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Member ID / Code</label>
                                    <Input 
                                        placeholder="e.g. 192837465" 
                                        value={formData.barcodeValue}
                                        onChange={e => setFormData({...formData, barcodeValue: e.target.value})}
                                    />
                                </div>

                                <div className="form-group row-group">
                                    <label>Code Type:</label>
                                    <div className="format-toggles">
                                        <button 
                                            className={`toggle-btn ${formData.format === '1D' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, format: '1D'})}
                                        >
                                            Barcode
                                        </button>
                                        <button 
                                            className={`toggle-btn ${formData.format === 'QR' ? 'active' : ''}`}
                                            onClick={() => setFormData({...formData, format: 'QR'})}
                                        >
                                            QR Code
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group row-group">
                                    <label>Card Color:</label>
                                    <input 
                                        type="color" 
                                        value={formData.colorTheme} 
                                        onChange={e => setFormData({...formData, colorTheme: e.target.value})}
                                        className="color-input"
                                    />
                                </div>
                                
                                <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                                    <Button 
                                        variant="primary" 
                                        fullWidth 
                                        onClick={handleSave}
                                        disabled={isSaving || !formData.gymName || !formData.barcodeValue}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Pass'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default GymCardModal;
