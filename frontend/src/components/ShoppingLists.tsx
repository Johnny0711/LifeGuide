import React, { useState, useEffect } from 'react';
import api from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import {
    Plus,
    Trash2,
    Check,
    ShoppingCart,
    Users,
    Send,
    ArrowLeft,
    X,
    UserPlus,
    LogOut
} from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import './ShoppingLists.css';

interface ShoppingListItem {
    id: string;
    text: string;
    completed: boolean;
}

interface ShoppingList {
    id: string;
    title: string;
    ownerName: string;
    ownerId: string;
    sharedWithNames: string[];
    items: ShoppingListItem[];
    createdAt: string;
}

const ShoppingLists: React.FC = () => {
    const { user } = useAuth();
    const [lists, setLists] = useState<ShoppingList[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
    const [newListTitle, setNewListTitle] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isCreatingList, setIsCreatingList] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [newItemText, setNewItemText] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [inviteUsername, setInviteUsername] = useState('');
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteError, setInviteError] = useState('');
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [isSendingInvite, setIsSendingInvite] = useState(false);

    useEffect(() => {
        fetchLists();
    }, []);

    const fetchLists = async () => {
        try {
            const response = await api.get('/shopping-lists');
            setLists(response.data);
        } catch (error) {
            console.error('Failed to fetch shopping lists', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;
        setIsCreatingList(true);
        try {
            const response = await api.post('/shopping-lists', { title: newListTitle.trim() });
            setLists(prev => [response.data, ...prev]);
            setNewListTitle('');
            setShowCreateForm(false);
        } catch (error) {
            console.error('Failed to create list', error);
        } finally {
            setIsCreatingList(false);
        }
    };

    const deleteList = async (id: string) => {
        setIsDeletingId(id);
        try {
            await api.delete(`/shopping-lists/${id}`);
            setLists(prev => prev.filter(l => l.id !== id));
            if (selectedList?.id === id) setSelectedList(null);
        } catch (error) {
            console.error('Failed to delete list', error);
        } finally {
            setIsDeletingId(null);
        }
    };

    const leaveList = async (id: string) => {
        setIsDeletingId(id);
        try {
            await api.delete(`/shopping-lists/${id}/leave`);
            setLists(prev => prev.filter(l => l.id !== id));
            if (selectedList?.id === id) setSelectedList(null);
        } catch (error) {
            console.error('Failed to leave list', error);
        } finally {
            setIsDeletingId(null);
        }
    };

    const openList = (list: ShoppingList) => {
        setSelectedList(list);
        setShowInviteForm(false);
        setInviteError('');
        setInviteSuccess('');
    };

    // --- Items ---

    const addItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemText.trim() || !selectedList) return;
        
        setIsAddingItem(true);
        try {
            const response = await api.post(`/shopping-lists/${selectedList.id}/items`, {
                text: newItemText.trim()
            });
            setSelectedList(prev => prev ? {
                ...prev,
                items: [...prev.items, response.data]
            } : null);
            setLists(prev => prev.map(l => l.id === selectedList.id
                ? { ...l, items: [...l.items, response.data] }
                : l
            ));
            setNewItemText('');
        } catch (error) {
            console.error('Failed to add item', error);
        } finally {
            setIsAddingItem(false);
        }
    };

    const toggleItem = async (itemId: string) => {
        if (!selectedList) return;
        
        const originalList = selectedList;
        
        setSelectedList(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                items: prev.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i)
            };
        });
        setLists(prevLists => prevLists.map(l => {
            if (l.id !== selectedList.id) return l;
            return {
                ...l,
                items: l.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i)
            };
        }));

        try {
            await api.put(`/shopping-lists/${selectedList.id}/items/${itemId}/toggle`);
        } catch (error) {
            console.error('Failed to toggle item', error);
            setSelectedList(originalList);
            setLists(prev => prev.map(l => l.id === originalList.id ? originalList : l));
        }
    };

    const deleteItem = async (itemId: string) => {
        if (!selectedList) return;
        
        const originalList = selectedList;
        
        setSelectedList(prev => prev ? {
            ...prev,
            items: prev.items.filter(i => i.id !== itemId)
        } : null);
        setLists(prevLists => prevLists.map(l => l.id === selectedList.id ? {
            ...l,
            items: l.items.filter(i => i.id !== itemId)
        } : l));

        try {
            await api.delete(`/shopping-lists/${selectedList.id}/items/${itemId}`);
        } catch (error) {
            console.error('Failed to delete item', error);
            setSelectedList(originalList);
            setLists(prev => prev.map(l => l.id === originalList.id ? originalList : l));
        }
    };

    // --- Invites ---

    const sendInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteUsername.trim() || !selectedList) return;
        setInviteError('');
        setInviteSuccess('');
        setIsSendingInvite(true);
        try {
            await api.post(`/shopping-lists/${selectedList.id}/invite`, {
                username: inviteUsername.trim()
            });
            setInviteSuccess(`Invitation sent to "${inviteUsername.trim()}"!`);
            setInviteUsername('');
        } catch (error: any) {
            const msg = error.response?.data?.message || error.response?.data || 'Invitation failed';
            setInviteError(typeof msg === 'string' ? msg : 'User not found');
        } finally {
            setIsSendingInvite(false);
        }
    };

    // --- Detail View ---
    if (selectedList) {
        const uncheckedItems = selectedList.items.filter(i => !i.completed);
        const checkedItems = selectedList.items.filter(i => i.completed);

        return (
            <div className="shopping-container animate-fade-in">
                <header className="shopping-header">
                    <div className="shopping-header-left">
                        <button className="back-btn" onClick={() => setSelectedList(null)}>
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <h1>{selectedList.title}</h1>
                            {selectedList.sharedWithNames.length > 0 && (
                                <p className="shared-info">
                                    <Users size={14} />
                                    Shared with {selectedList.sharedWithNames.join(', ')}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => { setShowInviteForm(!showInviteForm); setInviteError(''); setInviteSuccess(''); }}
                        leftIcon={<UserPlus size={18} />}
                    >
                        Invite
                    </Button>
                </header>

                {showInviteForm && (
                    <Card className="invite-card" noPadding={false}>
                        <form onSubmit={sendInvite} className="invite-form">
                            <Input
                                fullWidth
                                placeholder="Enter username..."
                                value={inviteUsername}
                                onChange={(e) => setInviteUsername(e.target.value)}
                            />
                            <Button type="submit" variant="primary" leftIcon={<Send size={16} />}
                                disabled={!inviteUsername.trim() || isSendingInvite}>
                                {isSendingInvite ? 'Sending...' : 'Send'}
                            </Button>
                        </form>
                        {inviteError && <p className="invite-error">{inviteError}</p>}
                        {inviteSuccess && <p className="invite-success">{inviteSuccess}</p>}
                    </Card>
                )}

                <Card className="shopping-detail-card" noPadding={false}>
                    <form onSubmit={addItem} className="add-item-form">
                        <Input
                            fullWidth
                            placeholder="Add an item..."
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                        />
                        <Button type="submit" variant="primary" leftIcon={<Plus size={18} />}
                            disabled={!newItemText.trim() || isAddingItem}>
                            {isAddingItem ? 'Adding...' : 'Add'}
                        </Button>
                    </form>

                    <ul className="shopping-items">
                        {uncheckedItems.map(item => (
                            <li key={item.id} className="shopping-item">
                                <button
                                    className="item-checkbox"
                                    onClick={() => toggleItem(item.id)}
                                    title="Mark as done"
                                >
                                    <div className="checkbox-circle" />
                                </button>
                                <span className="item-text">{item.text}</span>
                                <button className="item-delete" onClick={() => deleteItem(item.id)}>
                                    <X size={16} />
                                </button>
                            </li>
                        ))}
                    </ul>

                    {checkedItems.length > 0 && (
                        <>
                            <div className="checked-divider">
                                <span>Done ({checkedItems.length})</span>
                            </div>
                            <ul className="shopping-items checked-section">
                                {checkedItems.map(item => (
                                    <li key={item.id} className="shopping-item completed">
                                        <button
                                            className="item-checkbox checked"
                                            onClick={() => toggleItem(item.id)}
                                            title="Mark as undone"
                                        >
                                            <Check size={14} />
                                        </button>
                                        <span className="item-text">{item.text}</span>
                                        <button className="item-delete" onClick={() => deleteItem(item.id)}>
                                            <X size={16} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {selectedList.items.length === 0 && (
                        <div className="empty-state">
                            No items yet. Add your first item above!
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    // --- List Overview ---
    return (
        <div className="shopping-container animate-fade-in">
            <header className="shopping-header">
                <div>
                    <h1>Shopping Lists</h1>
                    <p>Create and share shopping lists with others.</p>
                </div>
                {!showCreateForm && (
                    <Button variant="primary" onClick={() => setShowCreateForm(true)} leftIcon={<Plus size={20} />}>
                        New List
                    </Button>
                )}
            </header>

            {showCreateForm && (
                <Card className="create-list-card" noPadding={false}>
                    <form onSubmit={createList} className="create-list-form">
                        <Input
                            fullWidth
                            placeholder="List name (e.g. Weekly Groceries)..."
                            value={newListTitle}
                            onChange={(e) => setNewListTitle(e.target.value)}
                            autoFocus
                        />
                        <div className="form-actions">
                            <Button type="button" variant="ghost" onClick={() => setShowCreateForm(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" leftIcon={<Plus size={18} />}
                                disabled={!newListTitle.trim() || isCreatingList}>
                                {isCreatingList ? 'Creating...' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {isLoading ? (
                <div className="empty-state">Loading lists...</div>
            ) : lists.length === 0 && !showCreateForm ? (
                <div className="empty-state">
                    No shopping lists yet. Create a new one to get started!
                </div>
            ) : (
                <div className="shopping-grid">
                    {lists.map(list => {
                        const totalItems = list.items.length;
                        const completedItems = list.items.filter(i => i.completed).length;
                        const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                        const isOwner = list.ownerId === user?.id;

                        return (
                            <Card
                                key={list.id}
                                className="shopping-list-card"
                                interactive
                                onClick={() => openList(list)}
                            >
                                <div className="list-card-header">
                                    <div className="list-card-icon">
                                        <ShoppingCart size={24} />
                                    </div>
                                    {isOwner ? (
                                        <button
                                            className={`list-card-delete ${isDeletingId === list.id ? 'loading' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}
                                            title="Delete list"
                                            disabled={isDeletingId === list.id}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            className={`list-card-delete ${isDeletingId === list.id ? 'loading' : ''}`}
                                            onClick={(e) => { e.stopPropagation(); leaveList(list.id); }}
                                            title="Leave list"
                                            disabled={isDeletingId === list.id}
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    )}
                                </div>
                                <h3 className="list-card-title">{list.title}</h3>
                                <div className="list-card-meta">
                                    <span>{completedItems}/{totalItems} items</span>
                                    {list.sharedWithNames.length > 0 && (
                                        <span className="shared-badge">
                                            <Users size={12} />
                                            {list.sharedWithNames.length + 1}
                                        </span>
                                    )}
                                </div>
                                <div className="list-progress-bar">
                                    <div
                                        className="list-progress-fill"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ShoppingLists;
