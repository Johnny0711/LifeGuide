import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { Mail, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import './Messages.css';

interface Invite {
    id: string;
    shoppingListId: string;
    shoppingListTitle: string;
    senderName: string;
    recipientName: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
    createdAt: string;
}

const Messages: React.FC = () => {
    const [invites, setInvites] = useState<Invite[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInvites();
    }, []);

    const fetchInvites = async () => {
        try {
            const response = await api.get('/shopping-lists/invites');
            setInvites(response.data);
        } catch (error) {
            console.error('Failed to fetch invites', error);
        } finally {
            setIsLoading(false);
        }
    };

    const acceptInvite = async (inviteId: string) => {
        try {
            const response = await api.post(`/shopping-lists/invites/${inviteId}/accept`);
            setInvites(prev => prev.map(i => i.id === inviteId ? response.data : i));
        } catch (error) {
            console.error('Failed to accept invite', error);
        }
    };

    const declineInvite = async (inviteId: string) => {
        try {
            const response = await api.post(`/shopping-lists/invites/${inviteId}/decline`);
            setInvites(prev => prev.map(i => i.id === inviteId ? response.data : i));
        } catch (error) {
            console.error('Failed to decline invite', error);
        }
    };

    const pendingInvites = invites.filter(i => i.status === 'PENDING');
    const pastInvites = invites.filter(i => i.status !== 'PENDING');

    return (
        <div className="messages-container animate-fade-in">
            <header className="messages-header">
                <h1>Messages</h1>
                <p>Invitations to shared shopping lists.</p>
            </header>

            {isLoading ? (
                <div className="empty-state">Loading messages...</div>
            ) : invites.length === 0 ? (
                <div className="empty-state-card">
                    <Mail size={48} strokeWidth={1.5} />
                    <p>No messages yet.</p>
                </div>
            ) : (
                <>
                    {pendingInvites.length > 0 && (
                        <div className="invite-section">
                            <h2 className="section-title">
                                New Invitations
                                <span className="badge">{pendingInvites.length}</span>
                            </h2>
                            <div className="invite-list">
                                {pendingInvites.map(invite => (
                                    <Card key={invite.id} className="invite-card-msg" noPadding={false}>
                                        <div className="invite-content">
                                            <div className="invite-icon">
                                                <ShoppingCart size={22} />
                                            </div>
                                            <div className="invite-info">
                                                <p className="invite-text">
                                                    <strong>{invite.senderName}</strong> invited you to the list{' '}
                                                    <strong>"{invite.shoppingListTitle}"</strong>.
                                                </p>
                                                <span className="invite-time">
                                                    {new Date(invite.createdAt).toLocaleDateString('en-US', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="invite-actions">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => acceptInvite(invite.id)}
                                                leftIcon={<CheckCircle size={16} />}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => declineInvite(invite.id)}
                                                leftIcon={<XCircle size={16} />}
                                            >
                                                Decline
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {pastInvites.length > 0 && (
                        <div className="invite-section">
                            <h2 className="section-title">Past Invitations</h2>
                            <div className="invite-list">
                                {pastInvites.map(invite => (
                                    <Card key={invite.id} className="invite-card-msg past" noPadding={false}>
                                        <div className="invite-content">
                                            <div className={`invite-icon ${invite.status === 'ACCEPTED' ? 'accepted' : 'declined'}`}>
                                                {invite.status === 'ACCEPTED'
                                                    ? <CheckCircle size={22} />
                                                    : <XCircle size={22} />}
                                            </div>
                                            <div className="invite-info">
                                                <p className="invite-text">
                                                    Invitation from <strong>{invite.senderName}</strong> to the list{' '}
                                                    <strong>"{invite.shoppingListTitle}"</strong>
                                                </p>
                                                <span className={`invite-status ${invite.status.toLowerCase()}`}>
                                                    {invite.status === 'ACCEPTED' ? 'Accepted' : 'Declined'}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Messages;
