#!/bin/bash

# Script para detener el sistema completo GastroDash Multi-Tenant

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     GASTRODASH MULTI-TENANT - DETENER SISTEMA            ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Detener Backend
echo -e "${CYAN}Deteniendo Backend...${NC}"
pkill -f "node src/index.js"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend detenido${NC}"
else
    echo -e "${YELLOW}⚠️  Backend no estaba corriendo${NC}"
fi

# Detener Frontend
echo -e "${CYAN}Deteniendo Frontend...${NC}"
pkill -f "vite"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend detenido${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend no estaba corriendo${NC}"
fi

echo ""
echo -e "${GREEN}✅ Sistema detenido correctamente${NC}"
echo ""
