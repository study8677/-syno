import React, { useState } from 'react';
import type { User, PersonaProfile } from '../types';

// FIX: Define ProfileModalProps interface
interface ProfileModalProps {
    user: User;
    onClose: () => void;
    onSave: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave }) => {
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
        const newPersona = { id: Date.now(), name: "新人格", description: "" };
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
            alert("必须保留至少一个人格。");
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
                <h2 className="text-2xl font-bold mb-6 text-syno-text flex-shrink-0">管理 AI 人格</h2>
                
                <div className="flex-grow overflow-y-auto -mr-4 pr-4 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {/* Left: Persona List */}
                    <div className="flex flex-col space-y-3">
                         {personas.map(p => (
                            <div key={p.id} className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${editingPersona?.id === p.id ? 'border-syno-primary/70 bg-syno-primary/5' : 'border-syno-border bg-syno-dark hover:border-syno-border'}`} onClick={() => setEditingPersona(p)}>
                                <div className="flex justify-between items-center">
                                    <div className="font-semibold text-syno-text">{p.name}</div>
                                    <div className="flex items-center space-x-2">
                                        {activePersonaId === p.id 
                                            ? <span className="text-xs font-medium text-syno-primary">当前</span>
                                            : <button onClick={(e) => {e.stopPropagation(); setActivePersonaId(p.id)}} className="text-xs font-medium text-syno-text-secondary hover:underline">设为当前</button>
                                        }
                                    </div>
                                </div>
                                <p className="text-sm text-syno-text-secondary mt-1 truncate">{p.description || "暂无描述"}</p>
                            </div>
                        ))}
                        <button onClick={handleAddNewPersona} className="w-full text-center p-3 rounded-lg border-2 border-dashed border-syno-border hover:bg-syno-border hover:border-syno-primary/50 transition-colors text-syno-primary font-medium">
                            + 添加新人格
                        </button>
                         <div className="border-t border-syno-border pt-6 mt-auto">
                             <h3 className="text-lg font-bold text-syno-text">高级设置</h3>
                             <p className="text-syno-text-secondary text-sm mb-4">可选。配置使用您自己的兼容OpenAI格式的API。如果留空，将使用默认的Gemini API。</p>
                             <div className="space-y-4">
                                <div>
                                     <label htmlFor="api-endpoint" className="block text-sm font-medium text-syno-text-secondary mb-1">API Endpoint</label>
                                    <input id="api-endpoint" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} className="w-full bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none" placeholder="例如：https://api.openai.com/v1/chat/completions"/>
                                </div>
                                <div>
                                     <label htmlFor="api-model" className="block text-sm font-medium text-syno-text-secondary mb-1">模型名称</label>
                                    <input id="api-model" value={apiModel} onChange={(e) => setApiModel(e.target.value)} className="w-full bg-syno-dark border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none" placeholder="例如：gpt-4-turbo"/>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Right: Persona Editor */}
                    <div className="flex flex-col">
                        {editingPersona ? (
                             <div className="p-4 bg-syno-dark rounded-lg border border-syno-border h-full flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-syno-text">编辑人格</h3>
                                    {personas.length > 1 && <button onClick={() => handleDeletePersona(editingPersona.id)} className="text-sm text-red-500 hover:underline">删除此人格</button>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-syno-text-secondary mb-1">人格名称</label>
                                    <input value={editingPersona.name} onChange={e => handleUpdateEditingPersona('name', e.target.value)} className="w-full bg-syno-dark-secondary border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none"/>
                                </div>
                                <div className="flex-grow flex flex-col">
                                    <label className="block text-sm font-medium text-syno-text-secondary mb-1">人格描述</label>
                                    <textarea value={editingPersona.description} onChange={e => handleUpdateEditingPersona('description', e.target.value)} rows={8} className="w-full bg-syno-dark-secondary border border-syno-border rounded-md p-2 text-syno-text focus:ring-2 focus:ring-syno-primary focus:outline-none flex-grow" placeholder="例如：一个言辞犀利、注重代码实践效率的资深软件架构师。"/>
                                </div>
                            </div>
                        ) : (
                             <div className="p-4 bg-syno-dark rounded-lg border border-syno-border flex items-center justify-center h-full text-syno-text-secondary">
                                从左侧选择一个人格进行编辑
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 flex justify-end space-x-4 mt-6 pt-6 border-t border-syno-border">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-syno-border text-syno-text-secondary hover:bg-opacity-80">
                        取消
                    </button>
                    <button type="button" onClick={handleSave} className="px-6 py-2 rounded-md bg-syno-primary text-white font-semibold hover:bg-syno-primary-hover">
                        保存更改
                    </button>
                </div>
            </div>
        </div>
    );
};
