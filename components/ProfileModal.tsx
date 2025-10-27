import React, { useState } from 'react';
import type { User, PersonaProfile } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ProfileModalProps {
    user: User;
    onClose: () => void;
    onSave: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave }) => {
    const { t } = useTranslation();
    const [personas, setPersonas] = useState<PersonaProfile[]>(user.personas);
    const [activePersonaId, setActivePersonaId] = useState(user.activePersonaId);
    const [apiEndpoint, setApiEndpoint] = useState(user.apiEndpoint || '');
    const [apiModel, setApiModel] = useState(user.apiModel || '');
    
    const [editingPersona, setEditingPersona] = useState<PersonaProfile | null>(null);

    const handleSave = () => {
        const updatedUser = {
            ...user,
            personas,
            activePersonaId,
            apiEndpoint: apiEndpoint.trim(),
            apiModel: apiModel.trim()
        };
        onSave(updatedUser);
    };

    const handleAddNewPersona = () => {
        const newPersona = { id: Date.now(), name: t('profileModal.newPersonaName'), description: "" };
        setPersonas([...personas, newPersona]);
        setEditingPersona(newPersona);
    };
    
    const handleUpdateEditingPersona = (field: 'name' | 'description', value: string) => {
        if (editingPersona) {
            const updated = { ...editingPersona, [field]: value };
            setEditingPersona(updated);
            setPersonas(personas.map(p => p.id === updated.id ? updated : p));
        }
    };
    
    const handleDeletePersona = (id: number) => {
        if (personas.length <= 1) {
            alert(t('profileModal.errorMinPersonas'));
            return;
        }
        if (id === activePersonaId) {
             setActivePersonaId(personas.find(p => p.id !== id)!.id);
        }
        setPersonas(personas.filter(p => p.id !== id));
        if (editingPersona?.id === id) {
            setEditingPersona(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40" onClick={onClose}>
            <div className="bg-syno-dark-secondary rounded-lg shadow-xl p-8 w-full max-w-4xl border border-syno-border flex flex-col h-[90vh] max-h-[700px]" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 text-syno-text flex-shrink-0">{t('profileModal.title')}</h2>
                
                <div className="flex-grow overflow-y-auto -mr-4 pr-4 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {/* Left: Persona List */}
                    <div className="flex flex-col space-y-3">
                         {personas.map(p => (
                            <div key={p.id} className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${editingPersona?.id === p.id ? 'border-syno-primary/70 bg-syno-primary/5' : 'border-syno-border bg-syno-dark hover:border-syno-border'}`} onClick={() => setEditingPersona(p)}>
                                <div className="flex justify-between items-center">
                                    <div className="font-semibold text-syno-text">{p.name}</div>
                                    <div className="flex items-center space-x-2">
                                        {activePersonaId === p.id 
                                            ? <span className="text-xs font-medium text-syno-primary">{t('profileModal.current')}</span>
                                            : <button onClick={(e) => {e.stopPropagation(); setActivePersonaId(p.id)}} className="text-xs font-medium text-syno-text-secondary hover:underline">{t('profileModal.setCurrent')}</button>
                                        }
                                    </div>
                                </div>
                                <p className="text-sm text-syno-text-secondary mt-1 truncate">{p.description || t('profileModal.noDescription')}</p>
                            </div>
                        ))}
                        <button onClick={handleAddNewPersona} className="w-full text-center p-3 rounded-lg border-2 border-dashed border-syno-border hover:bg-syno-border hover:border-syno-primary/50 transition-colors text-syno-primary font-medium">
                            + {t('profileModal.addNew')}
                        </button>
                         <div className="border-t border-syno-border pt-6 mt-6">
                             <h3 className="text-lg font-bold text-syno-text">{t('profileModal.advanced.title')}</h3>
                             <p className="text-syno-text-secondary text-sm mb-4">{t('profileModal.advanced.subtitle')}</p>
                             <div className="space-y-4">
                                <div>
                                     <label htmlFor="api-endpoint" className="block text-sm font-medium text-syno-text-secondary mb-1">{t('profileModal.advanced.endpointLabel')}</label>
                                    <input id="api-endpoint" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} className="w-full bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none" placeholder="e.g., https://api.openai.com/v1/chat/completions"/>
                                </div>
                                <div>
                                     <label htmlFor="api-model" className="block text-sm font-medium text-syno-text-secondary mb-1">{t('profileModal.advanced.modelLabel')}</label>
                                    <input id="api-model" value={apiModel} onChange={(e) => setApiModel(e.target.value)} className="w-full bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none" placeholder="e.g., gpt-4-turbo"/>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Right: Persona Editor */}
                    <div className="flex flex-col">
                        {editingPersona ? (
                             <div className="p-4 bg-syno-dark rounded-lg border border-syno-border h-full flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-syno-text">{t('profileModal.edit.title')}</h3>
                                    {personas.length > 1 && <button onClick={() => handleDeletePersona(editingPersona.id)} className="text-sm text-red-500 hover:underline">{t('profileModal.edit.delete')}</button>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-syno-text-secondary mb-1">{t('profileModal.edit.nameLabel')}</label>
                                    <input value={editingPersona.name} onChange={e => handleUpdateEditingPersona('name', e.target.value)} className="w-full bg-syno-dark-secondary border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none"/>
                                </div>
                                <div className="flex-grow flex flex-col">
                                    <label className="block text-sm font-medium text-syno-text-secondary mb-1">{t('profileModal.edit.descriptionLabel')}</label>
                                    <textarea value={editingPersona.description} onChange={e => handleUpdateEditingPersona('description', e.target.value)} rows={8} className="w-full bg-syno-dark-secondary border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none flex-grow" placeholder={t('profileModal.edit.descriptionPlaceholder')}/>
                                </div>
                            </div>
                        ) : (
                             <div className="p-4 bg-syno-dark rounded-lg border border-syno-border flex items-center justify-center h-full text-syno-text-secondary">
                                {t('profileModal.edit.selectPrompt')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 flex justify-end space-x-4 mt-6 pt-6 border-t border-syno-border">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-syno-border text-syno-text-secondary hover:bg-opacity-80">
                        {t('common.cancel')}
                    </button>
                    <button type="button" onClick={handleSave} className="px-6 py-2 rounded-md bg-syno-primary text-white font-semibold hover:bg-syno-primary-hover">
                        {t('common.saveChanges')}
                    </button>
                </div>
            </div>
        </div>
    );
};
