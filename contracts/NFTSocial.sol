import React, { useState } from 'react';
import { useContract, useProvider, useSigner } from 'wagmi';
import { ethers } from 'ethers';

const NFTMintingForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        category: '',
        matchId: '',
        image: null
    });
    
    const [isMinting, setIsMinting] = useState(false);
    const [mintStatus, setMintStatus] = useState('');
    
    const provider = useProvider();
    const { data: signer } = useSigner();
    
    const contract = useContract({
        address: COMMUNITY_NFT_ADDRESS,
        abi: COMMUNITY_NFT_ABI,
        signerOrProvider: signer || provider,
    });

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Subir a IPFS
            const ipfsHash = await uploadToIPFS(file);
            setFormData(prev => ({ ...prev, image: ipfsHash }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsMinting(true);
        setMintStatus('Subiendo imagen a IPFS...');
        
        try {
            // 1. Subir imagen a IPFS
            const imageURI = await uploadToIPFS(formData.image);
            setMintStatus('Imagen subida. Creando metadata...');
            
            // 2. Crear metadata JSON
            const metadata = {
                name: formData.title,
                description: formData.description,
                image: imageURI,
                attributes: [
                    { trait_type: "Location", value: formData.location },
                    { trait_type: "Category", value: formData.category },
                    { trait_type: "Match ID", value: formData.matchId },
                    { trait_type: "Created", value: new Date().toISOString() }
                ]
            };
            
            // 3. Subir metadata a IPFS
            const metadataURI = await uploadToIPFS(JSON.stringify(metadata));
            setMintStatus('Metadata creada. Minteando NFT...');
            
            // 4. Llamar al smart contract
            const mintPrice = ethers.utils.parseEther("0.01");
            
            const tx = await contract.mintExperience(
                formData.matchId || 0,
                formData.title,
                formData.description,
                metadataURI,
                formData.location,
                formData.category,
                { value: mintPrice }
            );
            
            setMintStatus('Transacción enviada. Esperando confirmación...');
            
            // 5. Esperar confirmación
            const receipt = await tx.wait();
            
            // 6. Obtener token ID del evento
            const event = receipt.events.find(e => e.event === 'ExperienceMinted');
            const tokenId = event.args.tokenId;
            
            setMintStatus(`¡NFT minteado exitosamente! Token ID: ${tokenId}`);
            
            // 7. Limpiar formulario
            setFormData({
                title: '',
                description: '',
                location: '',
                category: '',
                matchId: '',
                image: null
            });
            
        } catch (error) {
            setMintStatus(`Error: ${error.message}`);
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Mintear NFT de Experiencia</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Título de la Experiencia
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Descripción
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Ubicación del Partido
                    </label>
                    <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Categoría
                    </label>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                    >
                        <option value="">Seleccionar categoría</option>
                        <option value="Gol">Gol</option>
                        <option value="Celebración">Celebración</option>
                        <option value="Momentazo">Momentazo</option>
                        <option value="Atmosphere">Atmosphere</option>
                        <option value="Fans">Fans</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        ID del Partido (opcional)
                    </label>
                    <input
                        type="number"
                        value={formData.matchId}
                        onChange={(e) => setFormData(prev => ({ ...prev, matchId: e.target.value }))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="123"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        Foto de la Experiencia
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        required
                    />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-blue-700">
                        <strong>Precio de minting:</strong> 0.01 ETH
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                        Tu NFT será único y se enviará directamente a tu wallet
                    </p>
                </div>
                
                <button
                    type="submit"
                    disabled={isMinting}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isMinting ? 'Minteando...' : 'Mintear NFT'}
                </button>
                
                {mintStatus && (
                    <div className="mt-4 p-3 rounded-md bg-gray-100">
                        <p className="text-sm text-gray-700">{mintStatus}</p>
                    </div>
                )}
            </form>
        </div>
    );
};

export default NFTMintingForm;