# 💰 Comando CRYPTO

## Información General

**Comando:** `.crypto`
**Aliases:** `cripto`, `bitcoin`, `ethereum`, `coin-price`
**Categoría:** Información / Finanzas
**Descripción:** Obtener información de criptomonedas y precios

**Estado:** ✅ Implementado

---

## 👥 Permisos Requeridos

| Rol | Puede Ejecutar |
|-----|---|
| **Usuarios Comunes** | ✅ Sí |
| **Administradores** | ✅ Sí |
| **Propietario** | ✅ Sí |

---

## 📋 Funcionalidad Técnica

### Descripción Detallada
Comando que obtiene precios en tiempo real, cambios de mercado y estadísticas de criptomonedas del mundo. Soporta Bitcoin, Ethereum, Dogecoin y más.

### Cómo Funciona
1. Usuario proporciona nombre o símbolo de cripto
2. Bot consulta API de criptomonedas
3. Obtiene precio, cambio 24h, cap de mercado
4. Devuelve formateado con gráficos de tendencia

---

## 🔧 Uso

### Sintaxis
```
.crypto <moneda>
.crypto <símbolo>
```

### Ejemplos
```
.crypto bitcoin          ← Precio de Bitcoin
.crypto btc              ← Bitcoin (símbolo)
.crypto ethereum         ← Precio de Ethereum
.crypto eth              ← Ethereum (símbolo)
.crypto dogecoin         ← Doge
.crypto doge             ← Doge (símbolo)
```

### Respuesta del Bot
✅ **Éxito:**
```
💎 BITCOIN (BTC)

💵 Precio: $42,500.00 USD
📈 Cambio 24h: +2.5% ✅
📊 Cap de Mercado: $850B
💧 Volumen: $25B
🔝 Máximo (24h): $43,200
🔻 Mínimo (24h): $41,800

⏰ Actualizado hace 2 minutos
```

❌ **Error:**
```
❌ Criptomoneda no encontrada: "asdasd"
Intenta: bitcoin, ethereum, dogecoin, etc.
```

---

## ⚙️ Configuración Técnica

| Propiedad | Valor |
|-----------|-------|
| **Cooldown** | 3000ms (3 segundos) |
| **Group Only** | No |
| **Admin Only** | No |
| **Owner Only** | No |
| **Requiere DB** | No |
| **API Externa** | CoinGecko API |
| **Requiere API Key** | No |

---

## 🔗 Dependencias

- `axios` - Para llamadas HTTP a API
- `Formatter.js` - Formateo de respuestas

---

## 💰 Criptomonedas Soportadas

```
Principales:
- Bitcoin (BTC, bitcoin)
- Ethereum (ETH, ethereum)
- Litecoin (LTC, litecoin)
- Ripple (XRP, ripple)
- Cardano (ADA, cardano)
- Polkadot (DOT, polkadot)
- Dogecoin (DOGE, dogecoin)

Alternativas:
- Solana (SOL, solana)
- Chainlink (LINK, chainlink)
- Polygon (MATIC, polygon)

... Y más de 5000 criptomonedas
```

---

## 📊 Datos Incluidos

```json
{
  "name": "Bitcoin",
  "symbol": "btc",
  "price_usd": 42500,
  "change_24h": 2.5,
  "market_cap": 850000000000,
  "volume_24h": 25000000000,
  "high_24h": 43200,
  "low_24h": 41800
}
```

---

## 💱 Monedas Fiat Soportadas

- USD (Dólares)
- EUR (Euros)
- MXN (Pesos Mexicanos)
- ARS (Pesos Argentinos)
- GBP (Libras Esterlinas)
- Y más de 30 monedas

---

## 📝 Notas Adicionales

- Precios en tiempo real (actualización cada minuto)
- Sin API key requerida (CoinGecko es gratuito)
- Soporta más de 5000 criptomonedas
- Datos fiables y precisos
- Perfecto para traders y inversores
- Cambios de precio mostrados con emojis (📈 ↑, 📉 ↓)
