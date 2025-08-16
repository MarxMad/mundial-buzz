# Integración de Wallets - MundialPredict

## Wallets Soportadas

MundialPredict soporta múltiples wallets para conectarse a Chiliz Chain:

### 🔷 MetaMask
- **Tipo**: Browser Extension
- **Soporte**: ✅ Completo
- **Instalación**: [metamask.io](https://metamask.io/)
- **Configuración**: Automática para Chiliz Chain

### 💎 Gemini Wallet
- **Tipo**: Browser Extension / Mobile
- **Soporte**: ✅ Completo
- **Instalación**: [gemini.com/wallet](https://www.gemini.com/wallet)
- **Configuración**: Automática para Chiliz Chain
- **Detección**: Automática si está instalada

### 🔗 WalletConnect
- **Tipo**: Protocol
- **Soporte**: ✅ Completo
- **Compatibilidad**: 200+ wallets móviles
- **Configuración**: QR Code scanning

## Configuración Técnica

### Wagmi Configuration

```typescript
// src/lib/wagmi-config.ts
import { createConfig, http } from 'wagmi'
import { chilizSpicy, chilizMainnet } from './chiliz-config'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Gemini wallet connector
const geminiWallet = injected({
  target: {
    id: 'gemini',
    name: 'Gemini Wallet',
    provider: (window as any)?.gemini,
  },
})

export const wagmiConfig = createConfig({
  chains: [chilizSpicy, chilizMainnet],
  connectors: [
    injected(),
    metaMask(),
    geminiWallet,
    walletConnect({ projectId }),
  ],
  transports: {
    [chilizSpicy.id]: http(),
    [chilizMainnet.id]: http(),
  },
})
```

### Hook de Wallet

```typescript
// src/hooks/useChilizWallet.ts
export const useChilizWallet = () => {
  // ... otras funciones
  
  // Conectar a Gemini específicamente
  const connectGemini = useCallback(async () => {
    await connectWallet('gemini')
  }, [connectWallet])
  
  // Detectar wallets disponibles
  const getAvailableWallets = useCallback(() => {
    return {
      wallets: connectors.map(c => ({ id: c.id, name: c.name })),
      hasMetaMask: !!(window as any)?.ethereum?.isMetaMask,
      hasGemini: (window as any)?.gemini !== undefined,
      hasCoinbaseWallet: !!(window as any)?.ethereum?.isCoinbaseWallet,
    }
  }, [connectors])
  
  return {
    connectWallet,
    connectGemini,
    getAvailableWallets,
    // ... otros returns
  }
}
```

## Componentes UI

### Dropdown de Wallets

Los componentes `Navbar` y `Hero` incluyen un dropdown que muestra automáticamente las wallets disponibles:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button className="btn-hero" disabled={isConnecting}>
      <Wallet className="mr-2 h-4 w-4" />
      {isConnecting ? "Conectando..." : "Conectar Wallet"}
      <ChevronDown className="ml-2 h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={() => connectWallet()}>
      <Wallet className="mr-2 h-4 w-4" />
      MetaMask
    </DropdownMenuItem>
    {availableWallets.hasGemini && (
      <DropdownMenuItem onClick={connectGemini}>
        <Wallet className="mr-2 h-4 w-4" />
        Gemini Wallet
      </DropdownMenuItem>
    )}
    <DropdownMenuItem onClick={() => connectWallet('walletconnect')}>
      <Wallet className="mr-2 h-4 w-4" />
      WalletConnect
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

## Detección Automática

La aplicación detecta automáticamente qué wallets están instaladas:

- **MetaMask**: `window.ethereum?.isMetaMask`
- **Gemini**: `window.gemini`
- **Coinbase Wallet**: `window.ethereum?.isCoinbaseWallet`

Solo se muestran las opciones de wallets que están realmente disponibles.

## Configuración de Red

### Chiliz Spicy Testnet
```json
{
  "chainId": "0x15B32",
  "chainName": "Chiliz Spicy Testnet",
  "rpcUrls": ["https://spicy-rpc.chiliz.com/"],
  "nativeCurrency": {
    "name": "CHZ",
    "symbol": "CHZ",
    "decimals": 18
  },
  "blockExplorerUrls": ["https://spicy-explorer.chiliz.com/"]
}
```

### Chiliz Mainnet
```json
{
  "chainId": "0x15B38",
  "chainName": "Chiliz Chain",
  "rpcUrls": ["https://anchor-rpc.chiliz.com/"],
  "nativeCurrency": {
    "name": "CHZ",
    "symbol": "CHZ",
    "decimals": 18
  },
  "blockExplorerUrls": ["https://chiliscan.com/"]
}
```

## Funcionalidades

### ✅ Implementadas
- [x] Conexión múltiple de wallets
- [x] Detección automática de wallets
- [x] Soporte para Gemini Wallet
- [x] Cambio automático de red
- [x] Mostrar balance de CHZ
- [x] Desconexión de wallet
- [x] UI responsive para móvil

### 🔄 En Desarrollo
- [ ] Soporte para más wallets móviles
- [ ] Integración con hardware wallets
- [ ] Soporte para múltiples cuentas
- [ ] Historial de transacciones

## Troubleshooting

### Gemini Wallet no se detecta
1. Verificar que Gemini Wallet esté instalada
2. Refrescar la página
3. Verificar que `window.gemini` esté disponible en DevTools

### Error de conexión
1. Verificar que la wallet esté desbloqueada
2. Verificar permisos del sitio web
3. Intentar desconectar y reconectar

### Red incorrecta
1. La aplicación solicitará automáticamente cambiar a Chiliz Chain
2. Aprobar el cambio de red en la wallet
3. Si falla, agregar manualmente la red con los parámetros arriba

## Recursos

- [Wagmi Documentation](https://wagmi.sh/)
- [Gemini Wallet](https://www.gemini.com/wallet)
- [Chiliz Chain Docs](https://docs.chiliz.com/)
- [WalletConnect](https://walletconnect.com/)